
'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth, connectAuthEmulator } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { Functions, connectFunctionsEmulator } from 'firebase/functions';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  functions: Functions | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: React.ReactNode;
  value: {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
    functions: Functions;
  };
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children, value }) => {
  const { auth, firestore, storage, functions } = value;

  useEffect(() => {
    // NOTE: This check is for development mode only.
    // In a production app, you would not include this block.
    if (process.env.NODE_ENV === 'development') {
      // Check if emulators are already connected to prevent re-connecting on hot reloads
      if (auth && !(auth as any).emulatorConfig) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      }
      if (firestore && !(firestore as any)._settings.host.includes('localhost')) {
          connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      if (storage && storage?._service?.host && !storage._service.host.includes('localhost')) {
          connectStorageEmulator(storage, 'localhost', 9199);
      }
      if (functions && functions?.customDomain && !functions.customDomain.includes('localhost')) {
          connectFunctionsEmulator(functions, 'localhost', 5001);
      }
    }
  }, [auth, firestore, storage, functions]);

  return (
    <FirebaseContext.Provider value={value}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
      throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};
  
export const useFirebaseApp = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebaseApp must be used within a FirebaseProvider');
    }
    return context.firebaseApp;
};

export const useAuth = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a FirebaseProvider');
    }
    return context.auth;
};

export const useFirestore = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirestore must be used within a FirebaseProvider');
    }
    return context.firestore;
};

export const useStorage = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a FirebaseProvider');
    }
    return context.storage;
};
