
'use client';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import '../globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const ADMIN_PASSWORD_SESSION_KEY = 'admin-authenticated';

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // We are on the login page, so we don't need to check for authentication
    if (pathname === '/admin/login') {
      setIsVerifying(false);
      return;
    }

    const isAuthenticated = sessionStorage.getItem(ADMIN_PASSWORD_SESSION_KEY) === 'true';

    if (!isAuthenticated) {
      router.replace('/admin/login');
    } else {
      setIsVerifying(false);
    }
  }, [pathname, router]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If on the login page, just render the login page, otherwise render the protected content
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If authenticated, render the admin content.
  const isAuthenticated = typeof window !== 'undefined' && sessionStorage.getItem(ADMIN_PASSWORD_SESSION_KEY) === 'true';
  if (isAuthenticated) {
      return <>{children}</>;
  }

  return null;
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
