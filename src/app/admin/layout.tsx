
'use client';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase';
import '../globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminLoginForm } from '@/components/admin-login-form';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (loading) {
      return; // Wait for user state to be determined
    }

    if (!user) {
      // If user is not logged in, stop verification and show login form
      setIsVerifying(false);
      return;
    }

    // User is logged in, check for admin claim
    user.getIdTokenResult(true) // Force refresh the token
      .then((idTokenResult) => {
        if (idTokenResult.claims.admin) {
          setIsAdmin(true);
        } else {
          // Non-admin user, show "access denied"
          setIsAdmin(false);
        }
        setIsVerifying(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setIsVerifying(false);
      });
  }, [user, loading, router]);
  
  if (isVerifying) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  if (!isAdmin) {
    return <AdminLoginForm />;
  }

  return <>{children}</>;
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
       <head />
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <FirebaseClientProvider>
            <div className="min-h-screen bg-background">
              <AdminAuthGuard>
                {children}
              </AdminAuthGuard>
              <Toaster />
            </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
