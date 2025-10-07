'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, collection, QuerySnapshot, query, QueryConstraint } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(path: string | null, ...queryConstraints: QueryConstraint[]) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!db || !path) {
        setLoading(false);
        return;
    }

    setLoading(true);
    
    // The query is now constructed inside the effect, ensuring `db` is available.
    const collectionRef = collection(db, path);
    const q = query(collectionRef, ...queryConstraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data: T[] = snapshot.docs.map(doc => ({ ...doc.data() as T, id: doc.id }));
        setData(data);
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // We stringify constraints to create a stable dependency for useEffect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, path, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
}
