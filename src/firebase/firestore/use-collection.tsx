'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, DocumentData, collection, QuerySnapshot, query, QueryConstraint } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(path: string | null, ...queryConstraints: QueryConstraint[]) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Create a stable JSON string representation of the constraints to use in the dependency array.
  // This prevents the effect from re-running on every render if the constraints object is re-created.
  const memoizedConstraints = JSON.stringify(queryConstraints.map(c => ({
    type: c.type,
    // A simplified representation of the constraint for dependency checking
    details: JSON.stringify((c as any)._queryConstraint)
  })));

  useEffect(() => {
    if (!db || !path) {
        setData([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    
    const collectionRef = collection(db, path);
    // Use the original queryConstraints, not the memoized string
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
        setData([]); // Clear data on error
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, path, memoizedConstraints]);

  return { data, loading, error };
}
