
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
  const isAdmin = context.auth.token.admin === true;
  if (!isAdmin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admin users can import data."
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
  const errors = [];
  let totalSuccessCount = 0;

  // 3. Firestore Batch Write Logic for each collection
  for (const collectionName in seedData) {
      if (Object.prototype.hasOwnProperty.call(seedData, collectionName)) {
          const docs = seedData[collectionName];
          if (!Array.isArray(docs)) {
              errors.push({ collection: collectionName, error: `The value for '${collectionName}' must be an array.` });
              continue;
          }

          const collectionRef = firestore.collection(collectionName);
          let collectionSuccessCount = 0;

          docs.forEach((docData, index) => {
              try {
                  const docRef = docData.id ? collectionRef.doc(String(docData.id)) : collectionRef.doc();
                  batch.set(docRef, {
                      ...docData,
                      // Adding timestamps, ensuring they don't overwrite existing ones if merging
                      createdAt: docData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
                      updatedAt: admin.firestore.FieldValue.serverTimestamp()
                  }, { merge: true });
                  collectionSuccessCount++;
              } catch (e) {
                  errors.push({ collection: collectionName, index, error: e.message });
              }
          });
          totalSuccessCount += collectionSuccessCount;
      }
  }


  // 4. Commit the Batch and Return Results
  if (errors.length > 0) {
      // If there were validation errors before batching, don't commit.
      return {
          success: false,
          message: "Validation errors occurred. No data was written.",
          totalSuccessCount: 0,
          failedCount: Object.keys(seedData).reduce((acc, key) => acc + seedData[key].length, 0),
          errors: errors,
      };
  }
  
  try {
    await batch.commit();
    return {
      success: true,
      message: "Data seeded successfully.",
      totalSuccessCount: totalSuccessCount,
      failedCount: errors.length,
      errors: errors,
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
