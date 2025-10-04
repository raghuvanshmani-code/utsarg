'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ShieldX } from 'lucide-react';
import { FirebaseClientProvider } from '@/firebase';
import { AdminLoginForm } from '@/components/admin-login-form';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      setIsChecking(false);
      return;
    }
    
    user.getIdTokenResult()
      .then((idTokenResult) => {
        if (idTokenResult.claims.admin) {
          setIsAdmin(true);
        }
        setIsChecking(false);
      })
      .catch(() => {
        setIsChecking(false);
      });
  }, [user, loading, router]);

  if (loading || isChecking) {
    return (
      <FirebaseClientProvider>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Verifying access...</p>
        </div>
      </FirebaseClientProvider>
    );
  }
  
  if (!user) {
    return (
        <FirebaseClientProvider>
            <AdminLoginForm />
        </FirebaseClientProvider>
    )
  }

  if (!isAdmin) {
      return (
        <FirebaseClientProvider>
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive">
                <ShieldX className="h-16 w-16 mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <button onClick={() => router.push('/account')} className="mt-4 text-sm underline">Go to your account</button>
            </div>
      </FirebaseClientProvider>
      )
  }

  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
