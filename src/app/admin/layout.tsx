'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading & Verifying Access...</p>
      </div>
    );
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
