
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Admin SDK only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Sets the admin custom claim on a user account. 
 * Can be called by an existing admin to make another user an admin.
 * Also allows the designated first admin to claim their role.
 */
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  const email = data.email;
  if (typeof email !== 'string' || !email) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "email" argument.');
  }

  // Check if the caller is the designated first admin and is claiming the role for themselves.
  const isFirstAdminClaim = email === 'raghuvanshmani876@gmail.com' && context.auth.token.email === email;

  // An existing admin can make anyone else an admin.
  const isExistingAdmin = context.auth.token.admin === true;

  if (!isExistingAdmin && !isFirstAdminClaim) {
    throw new functions.https.HttpsError('permission-denied', 'You must be an admin to perform this action.');
  }
  
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `Success! ${email} has been made an admin.` };
  } catch (error) {
    console.error("Error setting admin claim:", error);
    if (error.code === 'auth/user-not-found') {
        throw new functions.https.HttpsError('not-found', 'User with this email not found.');
    }
    throw new functions.https-HttpsError('internal', 'An unexpected error occurred.');
  }
});
