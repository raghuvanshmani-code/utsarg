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

  if (process.env.NODE_ENV === 'development') {
    // Check if emulators are already running to avoid re-connecting
    // This is a common pattern to prevent errors during Next.js hot reloads
    if (auth && !(auth as any).emulatorConfig) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    }
    if (firestore && !(firestore as any)._settings.host.includes('127.0.0.1')) {
        connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    }
    if (storage && storage?._service?.host && !storage._service.host.includes('127.0.0.1')) {
        connectStorageEmulator(storage, '127.0.0.1', 9199);
    }
    if (functions && functions?.customDomain && !functions.customDomain.includes('127.0.0.1')) {
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }
  }

  return { firebaseApp: app, auth, firestore, storage, functions };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore, useStorage } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
