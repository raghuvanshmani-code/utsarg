
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = getFirestore();

/**
 * Validates a document against a simplified schema.
 * @param {object} docData - The document data to validate.
 * @param {string[]} requiredFields - An array of required field names.
 * @returns {string|null} - An error message string if validation fails, otherwise null.
 */
function validateDocument(docData, requiredFields) {
    if (!docData || typeof docData !== 'object') {
        return "Document data is not a valid object.";
    }
    if (!requiredFields || requiredFields.length === 0) {
        return null; // No fields to validate
    }
    for (const field of requiredFields) {
        if (!docData.hasOwnProperty(field)) {
            return `Missing required field: '${field}'.`;
        }
    }
    return null;
}


/**
 * A callable Cloud Function to securely import seed data into Firestore collections.
 * - Requires authentication.
 * - Processes data in safe batches to avoid Firestore limits.
 * - Converts specified date strings to Firestore Timestamps.
 * - Logs each seed operation for auditing purposes.
 * - Returns a detailed report of the operation.
 */
exports.importSeedDocuments = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be authenticated to call this function."
        );
    }
    
    // 2. Input Validation
    const { seedData } = data;
    if (!seedData || typeof seedData !== 'object' || Object.keys(seedData).length === 0) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The 'seedData' payload must be a non-empty object."
        );
    }

    const schemas = {
        users: ['uid', 'name', 'email', 'role'],
        clubs: ['name', 'description'],
        events: ['title', 'description'],
        gallery: ['title', 'type', 'mediaURL'],
        blog: ['title', 'summary', 'author', 'date', 'content'],
        uploads: ['secure_url', 'public_id'],
    };

    const report = {
        successCount: 0,
        failedCount: 0,
        errors: [],
    };
    const MAX_WRITES_PER_BATCH = 300;
    const dateFields = ['createdAt', 'updatedAt', 'date', 'uploadedAt'];
    let batch = db.batch();
    let writeCount = 0;

    // 3. Process Each Collection
    for (const collectionName in seedData) {
        if (Object.prototype.hasOwnProperty.call(seedData, collectionName)) {
            const docs = seedData[collectionName];
            if (typeof docs !== 'object' || docs === null || Array.isArray(docs)) {
                report.errors.push({ collection: collectionName, id: 'N/A', error: `Data for '${collectionName}' must be an object of documents, not an array or other type.` });
                report.failedCount += Object.keys(docs || {}).length;
                continue;
            }

            for (const docId in docs) {
                if (Object.prototype.hasOwnProperty.call(docs, docId)) {
                    let docData = { ...docs[docId] };

                    // Validate document shape
                    const requiredFields = schemas[collectionName];
                    if (requiredFields) {
                        const validationError = validateDocument(docData, requiredFields);
                        if (validationError) {
                            report.failedCount++;
                            report.errors.push({ collection: collectionName, id: docId, error: validationError });
                            continue; // Skip this document
                        }
                    }
                    
                    // Convert date strings to Timestamps and add server timestamps
                    const now = Timestamp.now();
                    docData.createdAt = docData.createdAt ? Timestamp.fromDate(new Date(docData.createdAt)) : now;
                    docData.updatedAt = now;

                    for (const field of dateFields) {
                        if (docData[field] && typeof docData[field] === 'string' && !field.includes('At')) {
                             try {
                               const d = new Date(docData[field]);
                               if (!isNaN(d)) {
                                docData[field] = Timestamp.fromDate(d);
                               }
                             } catch (e) {
                               // Ignore if parsing fails, keep original string
                             }
                        }
                    }
                    
                    const docRef = db.collection(collectionName).doc(docId);
                    batch.set(docRef, docData, { merge: true });
                    writeCount++;

                    // Commit batch if it's full
                    if (writeCount >= MAX_WRITES_PER_BATCH) {
                        try {
                            await batch.commit();
                            report.successCount += writeCount;
                        } catch (e) {
                            report.failedCount += writeCount;
                            report.errors.push({ collection: 'BATCH_COMMIT', id: 'N/A', error: e.message });
                        } finally {
                            batch = db.batch(); // Start a new batch
                            writeCount = 0;
                        }
                    }
                }
            }
        }
    }

    // 4. Commit any remaining writes in the last batch
    if (writeCount > 0) {
        try {
            await batch.commit();
            report.successCount += writeCount;
        } catch(e) {
            report.failedCount += writeCount;
            report.errors.push({ collection: 'FINAL_BATCH_COMMIT', id: 'N/A', error: e.message });
        }
    }
    
    // 5. Log the seed operation for auditing
    const seedLog = {
        runBy: context.auth.uid,
        runAt: Timestamp.now(),
        collectionsSeeded: Object.keys(seedData),
        report: report,
    };

    try {
      const logRef = await db.collection("seeds").add(seedLog);
      return {
        status: report.failedCount > 0 ? "Completed with errors" : "Success",
        ...report,
        logId: logRef.id
      };
    } catch (e) {
        // This error would happen if the 'seeds' collection itself can't be written to.
        // It should be reported back to the client.
         throw new functions.https.HttpsError(
            "internal",
            `Seeding partially completed but failed to write audit log. Error: ${e.message}`,
            { report }
        );
    }
});

    