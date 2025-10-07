
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
  // 1. Authentication and Authorization Checks
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  // Admin check is commented out to allow any authenticated user to seed data.
  // For production, you would want to enable this and set custom claims.
  // const isAdmin = context.auth.token.admin === true;
  // if (!isAdmin) {
  //   throw new functions.https.HttpsError(
  //     "permission-denied",
  //     "Only admin users can import data."
  //   );
  // }

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
  const errors = [];
  let totalSuccessCount = 0;
  const now = new Date(); // Use a standard JS Date for server-side operations

  // 3. Firestore Batch Write Logic for each collection
  for (const collectionName in seedData) {
      if (Object.prototype.hasOwnProperty.call(seedData, collectionName)) {
          const docs = seedData[collectionName];
          if (typeof docs !== 'object' || docs === null || Array.isArray(docs)) {
              errors.push({ collection: collectionName, error: `The value for '${collectionName}' must be an object of documents.` });
              continue; // Skip to the next collection if the format is wrong
          }

          const collectionRef = firestore.collection(collectionName);
          let collectionSuccessCount = 0;

          for (const docId in docs) {
              if (Object.prototype.hasOwnProperty.call(docs, docId)) {
                  try {
                      const docData = docs[docId];
                      const docRef = collectionRef.doc(docId); // Use the key as the document ID
                      
                      const dataToSet = {
                          ...docData,
                          // Use the server-side timestamp for creation and update times.
                          // The 'createdAt' from the JSON will be overwritten to ensure consistency.
                          createdAt: now,
                          updatedAt: now
                      };
                      
                      batch.set(docRef, dataToSet, { merge: true });
                      collectionSuccessCount++;
                  } catch (e) {
                      errors.push({ collection: collectionName, docId: docId, error: e.message });
                  }
              }
          }
          totalSuccessCount += collectionSuccessCount;
      }
  }


  // 4. Commit the Batch and Return Results
  if (errors.length > 0) {
      // If there were validation errors before batching, don't commit.
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Validation errors occurred. No data was written.",
        { errors }
      );
  }
  
  try {
    await batch.commit();
    return {
      success: true,
      message: "Data seeded successfully.",
      totalSuccessCount: totalSuccessCount,
      failedCount: 0,
      errors: [],
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
