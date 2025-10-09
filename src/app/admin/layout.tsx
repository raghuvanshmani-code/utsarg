
'use client';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import '../globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // This component will only be rendered on the client,
    // so sessionStorage is safe to use.
    const loggedIn = sessionStorage.getItem('admin-logged-in') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoggedIn) {
    return <>{children}</>;
  }

  // While redirecting, show nothing to prevent content flashing
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
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
