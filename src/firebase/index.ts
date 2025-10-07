
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
} {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const functions = getFunctions(app);

  if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || 'localhost';
    
    // Check if emulators are already connected to prevent errors on hot-reloads
    // This is a common pattern in Next.js development with Fast Refresh.
    if (!(auth as any)._isEmulator) {
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    }
    if (!(firestore as any)._isEmulator) {
      connectFirestoreEmulator(firestore, host, 8080);
    }
    if (!(storage as any)._isEmulator) {
      connectStorageEmulator(storage, host, 9199);
    }
    if (!(functions as any)._isEmulator) {
      connectFunctionsEmulator(functions, host, 5001);
    }
  }

  return { firebaseApp: app, auth, firestore, storage, functions };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore, useStorage, useFunctions } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
