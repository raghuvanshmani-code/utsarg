
'use client';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import '../globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

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
              {children}
              <Toaster />
            </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
