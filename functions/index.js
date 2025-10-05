const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Admin SDK only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Sets the admin custom claim on a user account, but only if the first admin
 * has not yet been created. This is a one-time operation.
 */
exports.makeFirstAdmin = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const firestore = admin.firestore();
  const metaRef = firestore.doc("meta/admin");

  try {
    const metaDoc = await metaRef.get();

    // If the meta doc already exists, it means an admin has been created.
    if (metaDoc.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        "An admin user has already been created."
      );
    }

    // Set the custom claim on the calling user.
    const uid = context.auth.uid;
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    // Create the meta document to prevent this function from being run again.
    await metaRef.set({
      adminCreated: true,
      firstAdminUid: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { message: "Success! You are now an admin." };

  } catch (error) {
    // Re-throw specific errors or a generic one for other cases.
    if (error.code === 'already-exists') {
      throw error;
    }
    console.error("Error in makeFirstAdmin function:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while trying to make you an admin."
    );
  }
});
