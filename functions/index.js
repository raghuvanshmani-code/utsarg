
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Admin SDK only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}


/**
 * Sets a custom claim on the first user to automatically grant admin privileges.
 * THIS IS A TEMPORARY FUNCTION and should be removed after the first admin is created.
 */
exports.makeFirstAdmin = functions.auth.user().onCreate(async (user) => {
  // Check if the new user is the designated first admin.
  // REPLACE THIS EMAIL with the actual email of the first admin user.
  if (user.email === 'raghuvanshmani876@gmail.com') {
    try {
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`Successfully made ${user.email} an admin.`);
      return { message: `Success! ${user.email} has been made an admin.` };
    } catch (error) {
      console.error('Error setting custom claim for first admin:', error);
    }
  }
  return null; // Do nothing for other users.
});


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
    if (error.code === 'auth/user-not-found') {
        throw new functions.https.HttpsError('not-found', 'User with this email not found.');
    }
    throw new functions.https.HttpsError('internal', 'An unexpected error occurred.');
  }
});
