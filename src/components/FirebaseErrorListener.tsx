'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export const FirebaseErrorListener = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error); // We still want to see the rich error in the console

      // In a dev environment, we can throw to leverage the Next.js error overlay
      if (process.env.NODE_ENV === 'development') {
        // A bit of a hack to get the error overlay to show up
        // This will be caught by the Next.js error boundary
        setTimeout(() => {
          throw error;
        }, 0);
      } else {
        // In production, show a generic toast
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You do not have permission to perform this action.',
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything
};

    