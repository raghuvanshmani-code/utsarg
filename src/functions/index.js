
const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * A callable function that allows an admin to bulk-import documents into Firestore
 * from a single JSON object containing multiple collections.
 */
exports.importSeedDocuments = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // 2. Input Validation
  const { seedData } = data;
  if (typeof seedData !== 'object' || seedData === null || Object.keys(seedData).length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The 'seedData' field must be a non-empty object."
      );
  }

  const firestore = admin.firestore();
  const batch = firestore.batch();
  let totalSuccessCount = 0;
  const now = new Date(); 

  // 3. Firestore Batch Write Logic for each collection
  try {
    for (const collectionName in seedData) {
        if (Object.prototype.hasOwnProperty.call(seedData, collectionName)) {
            const docs = seedData[collectionName];
            
            // Ensure the collection data is an object
            if (typeof docs !== 'object' || docs === null || Array.isArray(docs)) {
                throw new functions.https.HttpsError(
                    "invalid-argument",
                    `The value for collection '${collectionName}' must be an object of documents.`
                );
            }

            const collectionRef = firestore.collection(collectionName);
            
            for (const docId in docs) {
                if (Object.prototype.hasOwnProperty.call(docs, docId)) {
                    const docData = docs[docId];
                    const docRef = collectionRef.doc(docId); // Use the key as the document ID
                    
                    const dataToSet = {
                        ...docData,
                        createdAt: now,
                        updatedAt: now
                    };
                    
                    batch.set(docRef, dataToSet, { merge: true });
                    totalSuccessCount++;
                }
            }
        }
    }
  } catch (error) {
     console.error("Error during batch preparation:", error);
     throw new functions.https.HttpsError(
      "internal",
      "An error occurred while preparing the data for import. Check Cloud Function logs.",
      error.message
    );
  }


  // 4. Commit the Batch and Return Results
  try {
    await batch.commit();
    return {
      success: true,
      message: `Data seeded successfully. Wrote ${totalSuccessCount} documents.`,
      totalSuccessCount: totalSuccessCount,
    };
  } catch (error) {
    console.error("Batch commit failed:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to write documents to Firestore. Check Cloud Function logs for details.",
      error.message
    );
  }
});
