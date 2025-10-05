
'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { AdminLoginForm } from '@/components/admin-login-form';
import { FirebaseClientProvider } from '@/firebase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (loading) {
      // Still waiting for Firebase to determine auth state.
      return; 
    }
    if (!user) {
      // No user is logged in. Stop verification and show login form.
      setIsVerifying(false);
      return;
    }

    // User is logged in, now check for admin claim.
    // Force a token refresh (true) to get the latest custom claims.
    user.getIdTokenResult(true).then((idTokenResult) => {
      if (idTokenResult.claims.admin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setIsVerifying(false);
    }).catch(() => {
      // If token fails to refresh, treat as non-admin.
      setIsAdmin(false);
      setIsVerifying(false);
    });

  }, [user, loading]);

  if (isVerifying || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Verifying Administrative Access...</p>
      </div>
    );
  }

  // If verification is done and user is not an admin, show a dedicated admin login form.
  if (!isAdmin) {
    return (
      <FirebaseClientProvider>
        <AdminLoginForm />
        <Toaster />
      </FirebaseClientProvider>
    );
  }
  
  // If user is an admin, render the admin panel.
  return (
    <div className="min-h-screen bg-background">
      {children}
      <Toaster />
    </div>
  );
}
