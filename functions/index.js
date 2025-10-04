
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Admin SDK
// The service account is automatically available in the Cloud Functions environment
if (!admin.apps.length) {
    admin.initializeApp();
}


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

/**
 * **TEMPORARY FUNCTION**
 * This function automatically assigns the 'admin' role to the first user with a specific email.
 * This is used for initial setup and should be removed after the first admin is created.
 */
exports.makeFirstAdmin = functions.auth.user().onCreate(async (user) => {
    // THIS IS THE EMAIL THAT WILL BECOME THE FIRST ADMIN
    const FIRST_ADMIN_EMAIL = "raghuvanshmani876@gmail.com";

    if (user.email === FIRST_ADMIN_EMAIL) {
        try {
            await admin.auth().setCustomUserClaims(user.uid, { admin: true });
            console.log(`Successfully made ${user.email} an admin.`);
            return null;
        } catch (error) {
            console.error(`Error setting custom claim for ${user.email}:`, error);
            return null;
        }
    }
    return null;
});
