
'use client';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase';
import '../globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { Loader2 } from 'lucide-react';
import { AdminLoginForm } from '@/components/admin-login-form';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
