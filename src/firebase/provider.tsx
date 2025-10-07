
'use client';

import React, { createContext, useContext } from 'react';
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

// This flag ensures we only connect to emulators once.
let emulatorsConnected = false;

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children, value }) => {
  const { auth, firestore, storage, functions } = value;

  // This logic now runs synchronously before the first render completes.
  // It ensures services are pointed to emulators before any other code can use them.
  if (process.env.NODE_ENV === 'development' && !emulatorsConnected) {
    if (auth) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    if (firestore) {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
    if (storage) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    if (functions) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
    emulatorsConnected = true;
  }

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
