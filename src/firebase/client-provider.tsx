'use client';

import React, { useState, useEffect } from 'react';
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
  // getFirebaseInstance ensures we don't re-initialize on every render.
  const firebase = getFirebaseInstance();

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
