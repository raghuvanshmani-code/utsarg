
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Ensure the caller is an admin before allowing them to set other admins.
  // This is a crucial security check.
  if (context.auth.token.admin !== true) {
    return { error: "Only admins can add other admins." };
  }

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
