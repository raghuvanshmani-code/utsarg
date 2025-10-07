'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, collection, QuerySnapshot } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(pathOrQuery: string | Query | null) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !pathOrQuery) {
      // Still loading if db or query is not ready, but don't set data
      if(!pathOrQuery) {
        setLoading(false);
        setData([]);
      }
      return;
    }

    setLoading(true);
    const isQuery = typeof pathOrQuery !== 'string';
    const queryToSnap = isQuery ? pathOrQuery : collection(db, pathOrQuery);
    
    const unsubscribe = onSnapshot(
      queryToSnap,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data: T[] = snapshot.docs.map(doc => ({ ...doc.data() as T, id: doc.id }));
        setData(data);
        setLoading(false);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: isQuery ? "Complex query" : pathOrQuery,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, pathOrQuery]);

  return { data, loading, error };
}
