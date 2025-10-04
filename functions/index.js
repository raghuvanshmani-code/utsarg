
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Admin SDK
// The service account is automatically available in the Cloud Functions environment
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (e) {
  console.log('Re-initializing admin');
}


exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // TEMPORARY: The check for admin is removed to allow the first admin to be created.
  // This MUST be restored after the first admin is created.
  // if (context.auth.token.admin !== true) {
  //   return { error: "Only admins can add other admins." };
  // }

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
