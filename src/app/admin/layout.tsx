'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FirebaseClientProvider } from '@/firebase';
import { getAuth } from 'firebase/auth';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const checkAdmin = async () => {
          try {
              const idTokenResult = await user.getIdTokenResult(true); // Force refresh
              const isAdminClaim = !!idTokenResult.claims.admin;
              setIsAdmin(isAdminClaim);
          } catch (error) {
              console.error("Error fetching ID token result:", error);
              setIsAdmin(false);
          } finally {
              setIsCheckingAdmin(false);
          }
      };
      checkAdmin();
    } else if (!loading) {
      setIsCheckingAdmin(false);
    }
  }, [user, loading, router]);


  if (loading || isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading & Verifying Access...</p>
      </div>
    );
  }

  // This was removed based on user request.
  // if (!isAdmin) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen bg-background">
  //       <h1 className="text-3xl font-bold text-destructive mb-4">Access Denied</h1>
  //       <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
  //       <Button onClick={() => getAuth().signOut().then(() => router.push('/'))}>Logout</Button>
  //     </div>
  //   );
  // }

  return (
    <FirebaseClientProvider>
        {children}
        <Toaster />
    </FirebaseClientProvider>
  );
}
