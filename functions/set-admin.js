// ONE-TIME USE SCRIPT to set an admin user in your LIVE Firebase project.
//
// How to run this script:
// 1. IMPORTANT: Make sure you have downloaded your service account key.
//    - Go to your Firebase project settings -> Service accounts.
//    - Click "Generate new private key" and save the JSON file.
//    - RENAME the downloaded file to "service-account.json".
//    - PLACE this "service-account.json" file inside the "functions" folder.
//
// 2. Open your terminal and navigate to the `functions` directory:
//    cd functions
//
// 3. Run the script with Node.js:
//    node set-admin.js
//
// 4. After running, you should see a success message. You can now log into your
//    live application's admin panel with the specified user.
//
// 5. SECURITY: Delete the "service-account.json" file after you're done.

const admin = require('firebase-admin');

// IMPORTANT: The user's email you want to make an admin.
const USER_EMAIL_TO_MAKE_ADMIN = 'raghuvanshmani876@gmail.com';

try {
  // Path to your service account key file.
  const serviceAccount = require('./service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin SDK initialized successfully.');

  async function setAdminClaim() {
    try {
      // Get the user by email
      const user = await admin.auth().getUserByEmail(USER_EMAIL_TO_MAKE_ADMIN);
      
      // Set the custom claim
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      
      console.log(`\nSUCCESS! Custom claim 'admin: true' was set for user: ${USER_EMAIL_TO_MAKE_ADMIN} (UID: ${user.uid})`);
      console.log('You should now be able to log in to the admin panel on your live site.');

    } catch (error) {
      console.error('\nERROR setting admin claim:', error.message);
      if (error.code === 'auth/user-not-found') {
        console.error(`\nThe user "${USER_EMAIL_TO_MAKE_ADMIN}" does not exist in your Firebase project.`);
      }
    } finally {
      // The script will exit automatically.
      process.exit(0);
    }
  }

  setAdminClaim();

} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('\nERROR: `service-account.json` not found.');
    console.error('Please follow step 1 in the instructions at the top of this file to download and place your service account key.');
  } else {
    console.error('\nAn unexpected error occurred:', error.message);
  }
  process.exit(1);
}
