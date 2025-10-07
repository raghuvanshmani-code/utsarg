// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const { Timestamp } = admin.firestore;
const crypto = require('crypto');

const MAX_BATCH = 400;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 300;

// helper: safe ISO date test
function isIsoDateString(s) {
  if (typeof s !== 'string') return false;
  // quick check then try Date parse
  const d = new Date(s);
  return !isNaN(d.getTime());
}

// helper: sanitize doc id
function sanitizeId(id) {
  if (typeof id !== 'string') return null;
  if (id.includes('/') || id.trim() === '') return null;
  return id;
}

// convert fields: only convert known date-like keys (date, createdAt, uploadedAt)
function sanitizeDocData(doc) {
  const out = {};
  for (const [k, v] of Object.entries(doc)) {
    if ((k.toLowerCase() === 'date' || k.toLowerCase().endsWith('date') || k.toLowerCase().endsWith('at')) && v != null) {
      if (isIsoDateString(v)) {
        out[k] = Timestamp.fromDate(new Date(v));
      } else {
        // keep original if not parseable (string or other) so we don't fail
        out[k] = v;
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

// commit batch with retries
async function commitBatchWithRetry(batch, batchDocIds = []) {
  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      await batch.commit();
      return { success: true };
    } catch (e) {
      attempt++;
      console.error(`Batch commit failed (attempt ${attempt})`, e && e.stack ? e.stack : e);
      if (attempt > MAX_RETRIES) {
        return { success: false, error: e, batchDocIds };
      }
      // exponential backoff
      await new Promise(res => setTimeout(res, RETRY_BASE_MS * Math.pow(2, attempt)));
    }
  }
}

// main callable function
exports.importSeedDocuments = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onCall(async (data, context) => {
    // auth check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Request not authenticated');
    }
    const claims = context.auth.token || {};
    if (!claims.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin claim required');
    }

    // Accept either docsByCollection passed in data OR read from a storage path in data.filePath
    let docsByCollection = data && data.docsByCollection;
    if (!docsByCollection && data && data.filePath) {
      // try read from Cloud Storage (optional)
      const { Storage } = require('@google-cloud/storage');
      const storage = new Storage();
      const match = data.filePath.match(/^gs:\/\/([^/]+)\/(.+)$/);
      if (!match) {
        throw new functions.https.HttpsError('invalid-argument', 'filePath must be a gs:// bucket path');
      }
      const bucketName = match[1], filePath = match[2];
      try {
        const contents = await storage.bucket(bucketName).file(filePath).download();
        docsByCollection = JSON.parse(contents.toString('utf8'));
      } catch (e) {
        console.error('Failed to read seed file from GCS', e && e.stack ? e.stack : e);
        throw new functions.https.HttpsError('internal', 'Failed to read seed file: ' + (e.message || e));
      }
    }

    if (!docsByCollection || typeof docsByCollection !== 'object') {
      throw new functions.https.HttpsError('invalid-argument', 'docsByCollection is required');
    }

    // Prepare report
    const seedId = crypto.randomUUID();
    const runByUid = context.auth.uid;
    const startedAt = admin.firestore.FieldValue.serverTimestamp();
    const report = {
      seedId,
      runByUid,
      startedAt: new Date().toISOString(),
      countsPerCollection: {},
      successCount: 0,
      failedCount: 0,
      errors: []
    };

    // seeding loop with batching
    let batch = db.batch();
    let batchCount = 0;
    let batchDocIds = [];

    // helper to finalize batch when hits limit
    async function flushBatchIfNeeded(force = false) {
      if (batchCount === 0) return;
      if (batchCount >= MAX_BATCH || force) {
        const res = await commitBatchWithRetry(batch, batchDocIds);
        if (!res.success) {
          // record batch failure
          const errMsg = `Batch commit failed permanently for docs: ${JSON.stringify(res.batchDocIds)}`;
          console.error(errMsg, res.error && res.error.stack ? res.error.stack : res.error);
          report.errors.push({ type: 'batch_commit', message: errMsg, error: (res.error && res.error.message) || String(res.error) });
          report.failedCount += res.batchDocIds.length;
        } else {
          report.successCount += batchDocIds.length;
        }
        // reset batch
        batch = db.batch();
        batchCount = 0;
        batchDocIds = [];
      }
    }

    // Iterate over collections
    try {
      for (const [collectionName, docs] of Object.entries(docsByCollection)) {
        if (!docs || typeof docs !== 'object') continue;
        const docIds = Object.keys(docs);
        report.countsPerCollection[collectionName] = docIds.length;

        for (const docIdRaw of docIds) {
          const sanitizedId = sanitizeId(docIdRaw);
          if (!sanitizedId) {
            const msg = `Skipping invalid doc id "${docIdRaw}" in collection "${collectionName}"`;
            console.warn(msg);
            report.errors.push({ type: 'invalid_doc_id', collection: collectionName, docId: docIdRaw, message: msg });
            report.failedCount++;
            continue;
          }

          let doc = docs[docIdRaw];
          if (!doc || typeof doc !== 'object') {
            const msg = `Skipping invalid doc payload for ${collectionName}/${docIdRaw}`;
            console.warn(msg);
            report.errors.push({ type: 'invalid_doc_payload', collection: collectionName, docId: docIdRaw, message: msg });
            report.failedCount++;
            continue;
          }

          // Sanitize/convert fields
          let docData;
          try {
            docData = sanitizeDocData(doc);
          } catch (e) {
            const msg = `Field sanitization error for ${collectionName}/${docIdRaw}: ${e && e.message ? e.message : String(e)}`;
            console.error(msg, e && e.stack ? e.stack : e);
            report.errors.push({ type: 'sanitization_error', collection: collectionName, docId: docIdRaw, message: msg });
            report.failedCount++;
            continue;
          }

          // Add to batch
          try {
            const ref = db.collection(collectionName).doc(sanitizedId);
            batch.set(ref, docData, { merge: true });
            batchCount++;
            batchDocIds.push(`${collectionName}/${sanitizedId}`);
          } catch (e) {
            const msg = `Batch add failed for ${collectionName}/${docIdRaw}: ${e && e.message ? e.message : String(e)}`;
            console.error(msg, e && e.stack ? e.stack : e);
            report.errors.push({ type: 'batch_add_error', collection: collectionName, docId: docIdRaw, message: msg });
            report.failedCount++;
            continue;
          }

          // flush if needed
          if (batchCount >= MAX_BATCH) {
            await flushBatchIfNeeded(true);
          }
        } // end per-doc
      } // end per-collection

      // final flush
      await flushBatchIfNeeded(true);

    } catch (e) {
      console.error('Unexpected exception during seeding loop', e && e.stack ? e.stack : e);
      report.errors.push({ type: 'unexpected', message: e && e.message ? e.message : String(e) });
    }

    // Finalize: write seed audit doc
    try {
      const seedRef = db.collection('seeds').doc(seedId);
      await seedRef.set({
        seedId,
        runByUid,
        startedAt: admin.firestore.Timestamp.now(),
        reportSummary: {
          countsPerCollection: report.countsPerCollection,
          successCount: report.successCount,
          failedCount: report.failedCount,
          errorsCount: report.errors.length
        },
        fullReport: report,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Failed to write seeds audit doc', e && e.stack ? e.stack : e);
      // don't fail the whole function for audit write errors; just log
      report.errors.push({ type: 'audit_write_failed', message: e && e.message ? e.message : String(e) });
    }

    // return cleaned report
    return { report };
  });
