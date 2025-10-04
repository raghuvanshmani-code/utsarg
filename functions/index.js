
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // TEMPORARY: The check for admin is removed to allow the first admin to be created.
  // This MUST be restored after the first admin is created.
  // if (context.auth.token.admin !== true) {
  //   return { error: "Only admins can add other admins." };
  // }

  const email = data.email;
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `Success! ${email} has been made an admin.` };
  } catch (error) {
    console.error("Error setting admin claim:", error);
    return { error: error.message };
  }
});
