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
    for (const field of requiredFields) {
        if (!docData.hasOwnProperty(field)) {
            return `Missing required field: '${field}'.`;
        }
    }
    return null;
}


/**
 * A callable Cloud Function to securely import seed data into Firestore collections.
 * - Requires authentication and an 'admin' custom claim.
 * - Processes data in safe batches to avoid Firestore limits.
 * - Converts ISO date strings to Firestore Timestamps.
 * - Logs each seed operation for auditing purposes.
 * - Returns a detailed report of the operation.
 */
exports.importSeedDocuments = functions.https.onCall(async (data, context) => {
    // 1. Authentication and Authorization Check
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be authenticated to call this function."
        );
    }
    const isAdminClaim = context.auth.token.admin === true;
    if (!isAdminClaim) {
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
            "The 'seedData' payload must be a non-empty object."
        );
    }

    const schemas = {
        users: ['uid', 'name', 'email', 'role'],
        clubs: ['name', 'description'],
        events: ['title', 'date', 'clubId'],
        gallery: ['title', 'type', 'mediaURL'],
        blog: ['title', 'summary', 'author', 'date', 'content'],
        uploads: ['secure_url', 'public_id', 'uploadedAt'],
    };

    const report = {
        successCount: 0,
        failedCount: 0,
        errors: [],
    };
    const MAX_WRITES_PER_BATCH = 300;
    let batch = db.batch();
    let writeCount = 0;
    const dateFields = ['createdAt', 'updatedAt', 'date', 'uploadedAt'];

    // 3. Process Each Collection
    for (const collectionName of Object.keys(seedData)) {
        const docs = seedData[collectionName];
        if (typeof docs !== 'object' || docs === null || Array.isArray(docs)) {
            report.errors.push({ collection: collectionName, id: 'N/A', error: `Data for '${collectionName}' must be an object of documents, not an array or other type.` });
            report.failedCount += Object.keys(docs || {}).length;
            continue;
        }

        for (const docId in docs) {
            if (Object.prototype.hasOwnProperty.call(docs, docId)) {
                let docData = docs[docId];

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
                           docData[field] = Timestamp.fromDate(new Date(docData[field]));
                         } catch (e) {
                           // Ignore if parsing fails, keep original string
                         }
                    }
                }
                
                const docRef = db.collection(collectionName).doc(docId);
                batch.set(docRef, docData);
                writeCount++;

                // Commit batch if it's full
                if (writeCount >= MAX_WRITES_PER_BATCH) {
                    await batch.commit();
                    report.successCount += writeCount;
                    batch = db.batch(); // Start a new batch
                    writeCount = 0;
                }
            }
        }
    }

    // 4. Commit any remaining writes in the last batch
    if (writeCount > 0) {
        await batch.commit();
        report.successCount += writeCount;
    }
    
    // 5. Log the seed operation for auditing
    const seedLog = {
        runBy: context.auth.uid,
        runAt: Timestamp.now(),
        collectionsSeeded: Object.keys(seedData),
        report: report,
    };

    const logRef = await db.collection("seeds").add(seedLog);

    return {
        status: report.failedCount > 0 ? "Completed with errors" : "Success",
        ...report,
        logId: logRef.id
    };
});
