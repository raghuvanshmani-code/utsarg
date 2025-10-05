'use client';
import { useUser, FirebaseClientProvider } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { AdminLoginForm } from '@/components/admin-login-form';
import { getAuth } from 'firebase/auth';

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
      return; // Wait for user state to be determined
    }
    if (!user) {
      setIsVerifying(false); // Not logged in, stop verification
      return;
    }

    // Force a token refresh to get the latest custom claims.
    user.getIdTokenResult(true).then((idTokenResult) => {
      if (idTokenResult.claims.admin) {
        setIsAdmin(true);
      }
      setIsVerifying(false);
    });
  }, [user, loading, router]);


  if (isVerifying || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading & Verifying Access...</p>
      </div>
    );
  }

  // If verification is done and user is not an admin, show login form.
  if (!user || !isAdmin) {
    return <AdminLoginForm />;
  }
  
  // If user is an admin, render the admin panel.
  return (
    <div className="min-h-screen bg-background">
      {children}
      <Toaster />
    </div>
  );
}
