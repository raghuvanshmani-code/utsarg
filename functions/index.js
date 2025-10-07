
const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * A callable function that allows an admin to bulk-import documents into Firestore.
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
  const { mode, docs } = data;
  const validModes = ["clubs", "events", "volunteers", "posts", "gallery", "finances"];
  if (!validModes.includes(mode)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Invalid mode "${mode}". Must be one of ${validModes.join(", ")}.`
    );
  }
  if (!Array.isArray(docs) || docs.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'docs' field must be a non-empty array."
    );
  }

  // 3. Firestore Batch Write Logic
  const firestore = admin.firestore();
  const collectionRef = firestore.collection(mode);
  const batch = firestore.batch();
  const errors = [];
  let successCount = 0;

  docs.forEach((docData, index) => {
    try {
      if (!docData.id) {
        // If no ID is provided, Firestore will auto-generate one.
        const docRef = collectionRef.doc();
        batch.set(docRef, {
            ...docData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // If an ID is provided, use it.
        const docRef = collectionRef.doc(String(docData.id));
        batch.set(docRef, {
            ...docData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true }); // Use merge to avoid overwriting existing data completely
      }

      // Special logic for volunteers: add them to the club's volunteer_list
      if (mode === 'volunteers' && docData.club && docData.id) {
        const clubRef = firestore.collection('clubs').doc(String(docData.club));
        batch.update(clubRef, {
          volunteer_list: admin.firestore.FieldValue.arrayUnion(docData.id)
        });
      }

      successCount++;
    } catch (e) {
      errors.push({ index, error: e.message });
    }
  });

  // 4. Commit the Batch and Return Results
  try {
    await batch.commit();
    return {
      success: true,
      successCount: successCount,
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
