'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData, DocumentReference } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T>(path: string) {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
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
