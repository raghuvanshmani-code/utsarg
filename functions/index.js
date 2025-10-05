
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Admin SDK only once at the top level.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * A callable function that allows the first user to claim admin privileges.
 * This is a one-time operation, secured by a document in Firestore.
 */
exports.makeFirstAdmin = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const firestore = admin.firestore();
  const adminMetaRef = firestore.doc("meta/admin");

  try {
    // Use a transaction to ensure atomic read/write.
    const result = await firestore.runTransaction(async (transaction) => {
      const adminMetaDoc = await transaction.get(adminMetaRef);

      if (adminMetaDoc.exists) {
        // If the document exists, an admin has already been created.
        throw new functions.https.HttpsError(
          "already-exists",
          "An admin user has already been created."
        );
      }

      // If we're here, no admin exists. Grant admin claims to the caller.
      const uid = context.auth.uid;
      await admin.auth().setCustomUserClaims(uid, { admin: true });

      // Create the meta document to block future calls.
      transaction.set(adminMetaRef, {
        adminCreated: true,
        firstAdminUid: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { message: "Success! You have been made an admin. Please sign out and sign back in for the changes to take effect." };
    });

    return result;

  } catch (error) {
    console.error("Error in makeFirstAdmin function:", error);
    // Re-throw specific errors or a generic one for others.
    if (error.code === 'already-exists') {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      error.message || "An unexpected error occurred."
    );
  }
});
