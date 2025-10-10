// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const { Timestamp } = admin.firestore;
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MAX_BATCH_SIZE = 400;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

/**
 * Callable Cloud Function to deploy Firestore security rules.
 */
exports.deployRules = functions.https.onCall(async (data, context) => {
  // Authentication check: Ensure the user is authenticated and has an admin claim.
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'You must be an admin to deploy rules.');
  }

  try {
    const rulesPath = path.join(__dirname, '..', 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    if (!rulesContent) {
        throw new functions.https.HttpsError('not-found', 'firestore.rules file is empty or could not be found.');
    }

    await admin.securityRules().releaseFirestoreRulesetFromSource(rulesContent);
    
    functions.logger.info(`Successfully deployed Firestore rules by admin user: ${context.auth.uid}`);
    return { success: true };
  } catch (error) {
    functions.logger.error('Error deploying Firestore rules:', error);
    throw new functions.https.HttpsError('internal', 'Failed to deploy rules.', error.message);
  }
});


/**
 * Callable Cloud Function to set custom claims on a user.
 * This is used by the admin panel to grant/revoke admin privileges.
 */
exports.setUserRole = functions
  .runWith({ memory: '128MB' })
  .https.onCall(async (data, context) => {
    // 1. Authentication and Authorization Check - REMOVED, anyone can call this.
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to manage user roles, but no admin check is performed.');
    }

    // 2. Input Validation
    const { uid, role } = data;
    if (typeof uid !== 'string' || !uid) {
      throw new functions.https.HttpsError('invalid-argument', 'The `uid` must be a non-empty string.');
    }
    if (role !== 'admin' && role !== 'user') {
      throw new functions.https.HttpsError('invalid-argument', 'The `role` must be either "admin" or "user".');
    }

    try {
      // 3. Set the custom claim
      const newClaims = role === 'admin' ? { admin: true } : { admin: false };
      await admin.auth().setCustomUserClaims(uid, newClaims);

      // 4. Update the user's profile in Firestore to reflect the change
      await db.collection('users').doc(uid).set({ 
        customClaims: newClaims 
      }, { merge: true });

      functions.logger.info(`Successfully set role '${role}' for user ${uid} by caller ${context.auth.uid}`);
      return { success: true, message: `Role successfully updated to ${role}.` };
    } catch (error) {
      functions.logger.error(`Error setting user role for UID: ${uid}`, { error: error.message });
      throw new functions.https.HttpsError('internal', 'An error occurred while setting the user role.', error.message);
    }
});


/**
 * Firestore Trigger: on user creation, create a corresponding user profile document.
 * This is crucial for the User Management page to be able to list all users.
 */
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, photoURL } = user;
    const userProfileRef = db.collection('users').doc(uid);

    // Using set with merge:true to be safe, though onCreate should be a new doc.
    return userProfileRef.set({
        uid,
        email,
        displayName: displayName || 'Unnamed User',
        photoURL: photoURL || null,
        createdAt: Timestamp.now(),
        customClaims: {} // Initially no claims
    }, { merge: true });
});


/**
 * Checks if a string is a valid ISO 8601 date string.
 * @param {string} s The string to check.
 * @returns {boolean} True if the string is a valid date.
 */
function isIsoDateString(s) {
  if (typeof s !== 'string' || !s) return false;
  const d = new Date(s);
  return !isNaN(d.getTime()) && d.toISOString() === s;
}

/**
 * Sanitizes a document ID to ensure it's valid for Firestore.
 * Rejects IDs with slashes.
 * @param {string} id The document ID.
 * @returns {string|null} The sanitized ID or null if invalid.
 */
function sanitizeId(id) {
  if (typeof id !== 'string' || id.trim() === '' || id.includes('/')) {
    return null;
  }
  return id.trim();
}

/**
 * Converts specific date-like fields in a document to Firestore Timestamps.
 * @param {object} doc The document data.
 * @returns {object} The document with converted date fields.
 */
function sanitizeDocData(doc) {
  const out = { ...doc };
  for (const [key, value] of Object.entries(out)) {
    if ((key.toLowerCase().endsWith('at') || key.toLowerCase().endsWith('date')) && isIsoDateString(value)) {
      out[key] = Timestamp.fromDate(new Date(value));
    }
  }
  // Ensure server timestamps for creation and update
  out.createdAt = out.createdAt && out.createdAt instanceof Timestamp ? out.createdAt : Timestamp.now();
  out.updatedAt = Timestamp.now();
  return out;
}

/**
 * Commits a Firestore batch with exponential backoff retry logic.
 * @param {admin.firestore.WriteBatch} batch The batch to commit.
 * @param {string[]} batchDocIds The document IDs in the batch for logging purposes.
 * @returns {Promise<{success: boolean, error?: Error, batchDocIds?: string[]}>}
 */
async function commitBatchWithRetry(batch, batchDocIds = []) {
  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      await batch.commit();
      return { success: true };
    } catch (e) {
      attempt++;
      functions.logger.error(`Batch commit failed (attempt ${attempt})`, {
        error: e.message,
        stack: e.stack,
        docIds: batchDocIds.slice(0, 10), // Log first 10 docs for context
      });
      if (attempt > MAX_RETRIES) {
        return { success: false, error: e, batchDocIds };
      }
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  return { success: false, error: new Error('Exceeded max retries for batch commit.'), batchDocIds };
}

/**
 * Callable Cloud Function to seed Firestore with documents from a JSON object.
 */
exports.importSeedDocuments = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onCall(async (data, context) => {
    // 1. Authentication and Authorization Check - REMOVED, anyone can call this.
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Request must be authenticated to seed data.');
    }

    // 2. Input Validation
    const { docsByCollection, isDryRun } = data;
    if (!docsByCollection || typeof docsByCollection !== 'object' || Object.keys(docsByCollection).length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'The `docsByCollection` payload must be a non-empty object.');
    }

    // 3. Initialize Report and Seeding Process
    const seedId = crypto.randomUUID();
    const report = {
      seedId,
      isDryRun,
      runByUid: context.auth.uid,
      startedAt: new Date().toISOString(),
      countsPerCollection: {},
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    if (isDryRun) {
        functions.logger.info(`[DRY RUN] Seed ID: ${seedId} by UID: ${context.auth.uid}`);
        for (const [collectionName, docs] of Object.entries(docsByCollection)) {
            const docIds = Object.keys(docs);
            report.countsPerCollection[collectionName] = docIds.length;
            report.successCount += docIds.length;
        }
        report.finishedAt = new Date().toISOString();
        return { report };
    }

    let batch = db.batch();
    let batchCount = 0;
    let batchDocIds = [];

    // Helper to flush batch when it hits the limit
    async function flushBatchIfNeeded(force = false) {
      if (batchCount === 0) return;
      if (batchCount >= MAX_BATCH_SIZE || force) {
        const res = await commitBatchWithRetry(batch, batchDocIds);
        if (res.success) {
          report.successCount += batchDocIds.length;
        } else {
          const errorMessage = `Batch commit failed permanently. See logs for details.`;
          functions.logger.error(errorMessage, { error: res.error, docs: res.batchDocIds });
          report.errors.push({ type: 'batch_commit_failure', message: errorMessage, docs: res.batchDocIds });
          report.failedCount += res.batchDocIds.length;
        }
        // Reset for the next batch
        batch = db.batch();
        batchCount = 0;
        batchDocIds = [];
      }
    }

    // 4. Iterate over collections and documents
    try {
      for (const [collectionName, docs] of Object.entries(docsByCollection)) {
        if (!docs || typeof docs !== 'object') {
          report.errors.push({ type: 'invalid_collection_payload', collection: collectionName, message: `Payload for ${collectionName} is not an object.` });
          continue;
        }
        const docIds = Object.keys(docs);
        report.countsPerCollection[collectionName] = docIds.length;

        for (const docIdRaw of docIds) {
          const docId = sanitizeId(docIdRaw);
          if (!docId) {
            const message = `Skipping invalid doc id "${docIdRaw}" in collection "${collectionName}"`;
            functions.logger.warn(message);
            report.errors.push({ type: 'invalid_doc_id', collection: collectionName, docId: docIdRaw, message });
            report.failedCount++;
            continue;
          }

          const docData = docs[docIdRaw];
          if (!docData || typeof docData !== 'object') {
            const message = `Skipping invalid doc payload for ${collectionName}/${docId}`;
            functions.logger.warn(message);
            report.errors.push({ type: 'invalid_doc_payload', collection: collectionName, docId, message });
            report.failedCount++;
            continue;
          }

          // Sanitize data (e.g., convert dates) before adding to batch
          const sanitizedData = sanitizeDocData(docData);
          const ref = db.collection(collectionName).doc(docId);
          batch.set(ref, sanitizedData, { merge: true });
          batchCount++;
          batchDocIds.push(`${collectionName}/${docId}`);

          await flushBatchIfNeeded();
        } // end per-doc loop
      } // end per-collection loop

      // Final flush for any remaining documents
      await flushBatchIfNeeded(true);
    } catch (e) {
      const message = 'An unexpected error occurred during the seeding loop.';
      functions.logger.error(message, { error: e.message, stack: e.stack });
      report.errors.push({ type: 'unexpected_error', message: e.message });
      // This is a critical failure, throw an error back to the client
      throw new functions.https.HttpsError('internal', message, { error: e.message });
    }

    // 5. Finalize by writing an audit log for the seed operation
    try {
      const seedLogRef = db.collection('seeds').doc(seedId);
      await seedLogRef.set({
        runBy: report.runByUid,
        runAt: Timestamp.now(),
        collectionsSeeded: Object.keys(report.countsPerCollection),
        report: {
          successCount: report.successCount,
          failedCount: report.failedCount,
          errors: report.errors.slice(0, 50), // Store a subset of errors
        },
      });
    } catch (e) {
      const message = 'Failed to write seed audit log.';
      functions.logger.error(message, { error: e.message, seedId });
      report.errors.push({ type: 'audit_log_failure', message: e.message });
    }

    // 6. Return the detailed report to the client
    return { report };
  });
