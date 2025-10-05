'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { FirebaseClientProvider } from '@/firebase';
import { AdminLoginForm } from '@/components/admin-login-form';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <FirebaseClientProvider>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Loading...</p>
        </div>
      </FirebaseClientProvider>
    );
  }

  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
