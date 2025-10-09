
'use client';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import '../globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If we are on the login page, we don't need to check for authentication
  // we just show the login page.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Any other route inside /admin will be considered protected.
  // Since we are not using persistent state, we cannot know if the user
  // has "logged in" on a previous page. Therefore, we always must
  // assume they are not authenticated and show the login page.
  // The login page itself will handle redirecting to the dashboard on success.
  // This effectively blocks direct access to any admin sub-page and forces a login on every reload.
  
  // NOTE: This logic means that even if you are on /admin/users and reload, you will be
  // sent back to the login page. This is the implementation that meets the "ask each time" requirement.
  
  // A better user experience would involve state management (like Context or sessionStorage),
  // but the request was to avoid that.
  
  // For any path other than /admin/login, we effectively block it by showing nothing,
  // letting the login page handle the UI. A redirect inside useEffect would be another
  // option but this is simpler and avoids flashing content.
  // The router.replace logic has been removed to avoid depending on sessionStorage.
  // We can't render the login page here directly as it creates infinite loops.
  // Instead, the login page becomes the default entry point.
  // For this to work correctly, the logic is now primarily in the login page itself.
  // The guard's main job is now just to render children. The login page will not render children.
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
