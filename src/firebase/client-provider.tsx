'use client';

import React, { useEffect } from 'react';
import { initializeFirebase, FirebaseProvider } from '.';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';
import { connectFunctionsEmulator } from 'firebase/functions';


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

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
      const { auth, firestore, storage, functions } = firebase;

      // This code now runs only on the client, so `window` is available.
      const host = window.location.hostname;

      // @ts-ignore - Check if emulators are already connected
      if (!auth.emulatorConfig) {
        connectAuthEmulator(auth as any, `http://${host}:9191`, { disableWarnings: true });
      }
      
      // @ts-ignore
      if (!firestore._settings.host.includes(host)) {
        connectFirestoreEmulator(firestore as any, host, 8080);
      }
      
      // @ts-ignore
      if (!storage.emulator) {
        connectStorageEmulator(storage as any, host, 9199);
      }
      
      // @ts-ignore
      if (!functions.emulatorOrigin) {
        connectFunctionsEmulator(functions as any, host, 5001);
      }
    }
  }, [firebase]);

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
