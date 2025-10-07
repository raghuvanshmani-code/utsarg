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
  
  const memoizedConstraints = JSON.stringify(queryConstraints);

  useEffect(() => {
    if (!db || !path) {
        setLoading(false);
        return;
    }

    setLoading(true);
    
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, path, memoizedConstraints]);

  return { data, loading, error };
}
