'use client';

import React from 'react';
import { initializeFirebase, FirebaseProvider } from '.';

// This ensures Firebase is initialized only once per client session.
let firebaseInstance: ReturnType<typeof initializeFirebase> | null = null;

const getFirebaseInstance = () => {
    if (!firebaseInstance) {
        firebaseInstance = initializeFirebase();
    }
    return firebaseInstance;
};

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const firebase = getFirebaseInstance();

  // The Firebase Hosting emulator will automatically configure the SDK
  // to connect to the other emulators. No manual connection is needed here.

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
