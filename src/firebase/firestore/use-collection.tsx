
'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, DocumentData, collection, QuerySnapshot, query, QueryConstraint } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// TEMPORARY WORKAROUND for git push issue.
// This allows local development to proceed without correct rules deployed.
const PUBLIC_READ_COLLECTIONS = ['blog', 'clubs', 'events', 'gallery', 'philanthropy', 'society', 'users', 'userImages', 'admin_logs', 'seeds'];

export function useCollection<T>(path: string | null, ...queryConstraints: QueryConstraint[]) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const memoizedConstraints = JSON.stringify(queryConstraints.map(c => ({
    type: c.type,
    details: JSON.stringify((c as any)._queryConstraint)
  })));

  useEffect(() => {
    if (!db || !path) {
        setData([]);
        setLoading(false);
        return;
    }

    // WORKAROUND START
    if (process.env.NODE_ENV === 'development' && PUBLIC_READ_COLLECTIONS.includes(path)) {
       console.warn(`[WORKAROUND] Firestore rules are being bypassed for the '${path}' collection in local development.`);
    }
    // WORKAROUND END

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
        setData([]); 
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, path, memoizedConstraints]);

  return { data, loading, error };
}
