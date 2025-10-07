
'use client';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase';
import '../globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { AdminLoginForm } from '@/components/admin-login-form';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is done and we have a user who is an admin, we are good.
    if (!loading && user && isAdmin) {
      return;
    }
    // If loading is done and there's no user or the user is not an admin,
    // we don't redirect here, we just show the login form.
  }, [user, isAdmin, loading, router]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Authenticating...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
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
            <AdminAuthGuard>
              {children}
            </AdminAuthGuard>
            <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
