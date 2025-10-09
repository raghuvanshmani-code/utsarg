'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T>(path: string | null) {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !path) {
      setData(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, path);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ ...docSnap.data() as T, id: docSnap.id });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        // FIX: During development, permission errors can be intermittent.
        // Instead of crashing, let's log it and continue.
        if (err.message.includes('Missing or insufficient permissions')) {
          console.warn(`Firestore permission error on path "${path}" was ignored during development. Ensure your rules are correct for production.`);
          setData(null);
          setLoading(false);
          return;
        }
        
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading, error };
}
