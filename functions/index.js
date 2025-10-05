
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Sets the admin custom claim on a user account. Can only be called by an existing admin.
 */
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin.
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can add other admins.');
  }

  const email = data.email;
  if (typeof email !== 'string' || !email) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "email" argument.');
  }
  
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `Success! ${email} has been made an admin.` };
  } catch (error) {
    console.error("Error setting admin claim:", error);
    if ((error as any).code === 'auth/user-not-found') {
        throw new functions.https.HttpsError('not-found', 'User with this email not found.');
    }
    throw new functions.https.HttpsError('internal', 'An unexpected error occurred.');
  }
});
