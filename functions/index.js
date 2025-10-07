/**
 * @fileoverview Cloud Functions for Firebase.
 * This file contains the robust `importSeedDocuments` callable function for seeding Firestore
 * and a placeholder for a daily backup scheduler.
 *
 * To deploy, run `firebase deploy --only functions`.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const BATCH_SIZE = 400; // Safe batch size, well below the 500 limit.

/**
 * Validates a single document against a simplified schema of required fields.
 * @param {object} docData The document data to validate.
 * @param {string[]} requiredFields An array of required field names.
 * @returns {string|null} An error message string if validation fails, otherwise null.
 */
function validateDocument(docData, requiredFields) {
    if (!docData || typeof docData !== 'object') {
        return "Document data is not a valid object.";
    }
    if (!requiredFields || requiredFields.length === 0) {
        return null; // No fields to validate
    }
    for (const field of requiredFields) {
        // Use hasOwnProperty to ensure the property is directly on the object.
        if (!Object.prototype.hasOwnProperty.call(docData, field)) {
            return `Missing required field: '${field}'.`;
        }
    }
    return null;
}

/**
 * A robust, production-ready callable Cloud Function to securely import seed data into Firestore.
 *
 * @param {object} data The data passed to the function, expecting `{ seedData: { [collectionName]: { [docId]: docData } } }`.
 * @param {functions.https.CallableContext} context The context of the call, including authentication information.
 * @returns {Promise<object>} A detailed report of the seeding operation.
 */
exports.importSeedDocuments = functions
  .region('us-central1') // Specify region for consistency
  .runWith({ timeoutSeconds: 540, memory: '1GB' }) // Increase timeout and memory for large seeds
  .https.onCall(async (data, context) => {
    
    // 1. Authentication and Authorization Check
    // Comment for admins: First, ensure you've set the custom claim on your user.
    // e.g., using a Node script with Admin SDK: `admin.auth().setCustomUserClaims(uid, {admin: true})`
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Authentication is required to call this function."
        );
    }
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "You must have an 'admin' custom claim to perform this operation."
        );
    }

    // 2. Input Validation
    const { seedData } = data;
    if (!seedData || typeof seedData !== 'object' || Object.keys(seedData).length === 0) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The 'seedData' payload must be a non-empty object where keys are collection names."
        );
    }

    // Schemas for validating required fields in each collection's documents.
    const schemas = {
        users: ['uid', 'name', 'email', 'role'],
        clubs: ['name', 'description'],
        events: ['title', 'description'],
        gallery: ['title', 'type', 'mediaURL'],
        blog: ['title', 'summary', 'author', 'date', 'content'],
        uploads: ['secure_url', 'public_id', 'uploadedAt'],
    };

    const report = {
        successCount: 0,
        failedCount: 0,
        errors: [],
    };
    
    // These are fields that, if they are valid ISO date strings, should be converted to Timestamps.
    const dateFieldsToConvert = ['createdAt', 'updatedAt', 'date', 'uploadedAt'];

    let batch = db.batch();
    let writeCountInBatch = 0;

    // 3. Process Each Collection
    for (const collectionName in seedData) {
        if (Object.prototype.hasOwnProperty.call(seedData, collectionName)) {
            const docs = seedData[collectionName];
            if (typeof docs !== 'object' || docs === null || Array.isArray(docs)) {
                const errorMsg = `Data for '${collectionName}' must be an object of documents, not an array or other type.`;
                functions.logger.error(errorMsg);
                report.errors.push({ collection: collectionName, id: 'N/A', error: errorMsg });
                report.failedCount += Object.keys(docs || {}).length;
                continue; // Skip this malformed collection
            }

            for (const docId in docs) {
                if (Object.prototype.hasOwnProperty.call(docs, docId)) {
                    // Document ID validation
                    if (docId.includes('/') || docId.startsWith('__')) {
                        report.failedCount++;
                        report.errors.push({ collection: collectionName, id: docId, error: "Invalid document ID. IDs cannot contain '/' or start with '__'." });
                        continue;
                    }

                    let docData = { ...docs[docId] };

                    // Document shape validation
                    const requiredFields = schemas[collectionName];
                    if (requiredFields) {
                        const validationError = validateDocument(docData, requiredFields);
                        if (validationError) {
                            report.failedCount++;
                            report.errors.push({ collection: collectionName, id: docId, error: validationError });
                            continue;
                        }
                    }
                    
                    // Safely convert date strings to Timestamps
                    for (const field of dateFieldsToConvert) {
                        if (docData[field] && typeof docData[field] === 'string') {
                             try {
                               const d = new Date(docData[field]);
                               // Check if the date is valid before converting
                               if (!isNaN(d.getTime())) {
                                docData[field] = admin.firestore.Timestamp.fromDate(d);
                               }
                             } catch (e) {
                                // Ignore if parsing fails, keep original string. Log this for debugging.
                                functions.logger.warn(`Could not parse date string '${docData[field]}' for doc '${docId}' in '${collectionName}'. Keeping original value.`);
                             }
                        }
                    }

                    // Add server timestamps for creation and update times.
                    // This will overwrite any 'updatedAt' from the seed file, which is desired behavior.
                    const now = admin.firestore.FieldValue.serverTimestamp();
                    docData.createdAt = docData.createdAt || now; // Keep original if it exists, else set now.
                    docData.updatedAt = now; // Always set/update to current time.
                    
                    const docRef = db.collection(collectionName).doc(docId);
                    batch.set(docRef, docData, { merge: true });
                    writeCountInBatch++;

                    // Commit batch if it's full
                    if (writeCountInBatch >= BATCH_SIZE) {
                        try {
                            await batch.commit();
                            report.successCount += writeCountInBatch;
                            functions.logger.info(`Committed batch of ${writeCountInBatch} docs for collection '${collectionName}'.`);
                        } catch (e) {
                            report.failedCount += writeCountInBatch;
                            const errorMsg = `Batch commit failed: ${e.message}`;
                            report.errors.push({ collection: collectionName, id: 'BATCH_COMMIT', error: errorMsg });
                            functions.logger.error(errorMsg, { batchSize: writeCountInBatch });
                        } finally {
                            batch = db.batch(); // Start a new batch
                            writeCountInBatch = 0;
                        }
                    }
                }
            }
        }
    }

    // 4. Commit any remaining writes in the last batch
    if (writeCountInBatch > 0) {
        try {
            await batch.commit();
            report.successCount += writeCountInBatch;
            functions.logger.info(`Committed final batch of ${writeCountInBatch} docs.`);
        } catch(e) {
            report.failedCount += writeCountInBatch;
            const errorMsg = `Final batch commit failed: ${e.message}`;
            report.errors.push({ collection: 'FINAL_BATCH_COMMIT', id: 'N/A', error: errorMsg });
            functions.logger.error(errorMsg, { batchSize: writeCountInBatch });
        }
    }
    
    // 5. Log the entire seed operation for auditing
    const seedLog = {
        runBy: context.auth.uid,
        runAt: admin.firestore.FieldValue.serverTimestamp(),
        collectionsSeeded: Object.keys(seedData),
        report: report,
    };

    try {
      const logRef = await db.collection("seeds").add(seedLog);
      functions.logger.info(`Seed operation successful. Log ID: ${logRef.id}`);
      return {
        status: report.failedCount > 0 ? "Completed with errors" : "Success",
        ...report,
        logId: logRef.id
      };
    } catch (e) {
         const finalError = `Seeding partially completed but failed to write audit log. Error: ${e.message}`;
         functions.logger.error(finalError, { report });
         // Throw an error that the client can interpret
         throw new functions.https.HttpsError(
            "internal",
            finalError,
            { report } // Send the partial report back to the client
        );
    }
});
