# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

### Testing the Database Seeder Locally

To test the `importSeedDocuments` Cloud Function safely before deploying, use the Firebase Local Emulator Suite.

**1. Start the Emulators:**

Ensure you have a seed file (e.g., `utsarg_seed.json`) in your project's root directory or a known path. Then run:

```bash
firebase emulators:start --only firestore,functions,auth
```

This will start local emulators for Firestore, Functions, and Authentication, which you can interact with without touching your live project.

**2. Set an Admin Custom Claim for a Test User:**

The seeder function requires the calling user to have an `admin:true` custom claim.

*   Go to the Emulator UI (usually `http://localhost:4000`).
*   Navigate to the **Authentication** tab.
*   Click "Add user" to create a test user.
*   Once created, find the user in the list, click the three-dot menu, and select "Edit user".
*   In the "Custom claims" field, enter `{"admin":true}`.
*   Save the changes. Note the UID of this test user.

**3. Run the Seeder from the Admin UI:**

*   Start your Next.js development server (`npm run dev`).
*   Open your application and navigate to the Admin Panel -> Seed Data page.
*   Sign in with the test user you created in the emulator.
*   Upload your `utsarg_seed.json` file.
*   First, click **"Perform Dry Run"** to validate the data without writing. Check the console for logs.
*   If the dry run is successful, toggle off "Dry Run Mode" and click **"Confirm & Seed Database"**.
*   Check the Emulator UI's Firestore tab to see the newly created documents. Check the Functions logs for the detailed report.
