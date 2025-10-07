
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
  const { user, loading: userLoading } = useUser();
  const [status, setStatus] = useState<'loading' | 'admin' | 'guest'>('loading');

  useEffect(() => {
    if (userLoading) {
      setStatus('loading');
      return;
    }

    if (!user) {
      setStatus('guest');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        // Force refresh the token to get the latest custom claims
        const idTokenResult = await user.getIdTokenResult(true);
        if (idTokenResult.claims.admin) {
          setStatus('admin');
        } else {
          setStatus('guest'); // User is logged in but not an admin
        }
      } catch (error) {
        console.error("Error verifying admin status:", error);
        setStatus('guest'); // Default to guest on any error
      }
    };

    checkAdminStatus();
  }, [user, userLoading]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'guest') {
    return <AdminLoginForm />;
  }

  // status === 'admin'
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
