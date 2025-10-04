'use client';

import React from 'react';
import { initializeFirebase, FirebaseProvider } from '.';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const firebase = initializeFirebase();

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}

    