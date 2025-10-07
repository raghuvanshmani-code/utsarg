
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
  // This check is commented out to allow seeding without custom claims for now.
  // Re-enable this for production security.
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
  const now = admin.firestore.FieldValue.serverTimestamp();

  // 3. Firestore Batch Write Logic for each collection
  for (const collectionName in seedData) {
      if (Object.prototype.hasOwnProperty.call(seedData, collectionName)) {
          const docs = seedData[collectionName];
          // **FIX:** The documents are in an object, not an array.
          if (typeof docs !== 'object' || docs === null || Array.isArray(docs)) {
              errors.push({ collection: collectionName, error: `The value for '${collectionName}' must be an object of documents.` });
              continue;
          }

          const collectionRef = firestore.collection(collectionName);
          let collectionSuccessCount = 0;

          // **FIX:** Iterate over the keys of the documents object.
          for (const docId in docs) {
              if (Object.prototype.hasOwnProperty.call(docs, docId)) {
                  try {
                      const docData = docs[docId];
                      const docRef = collectionRef.doc(docId); // Use the key as the document ID
                      
                      // Prepare data for setting, ensuring not to mutate original object
                      const dataToSet = {
                          ...docData,
                          // Use the server timestamp for creation and update times.
                          // The `createdAt` in the JSON will be overwritten if it exists.
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
      "Failed to write documents to Firestore.",
      error.message
    );
  }
});
