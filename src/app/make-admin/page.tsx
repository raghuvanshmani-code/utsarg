'use client';
import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from "@/components/ui/button";
import { useUser, useFirebaseApp } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';
import { getAuth } from 'firebase/auth';

export default function MakeAdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      user.getIdTokenResult().then(token => {
        if (token.claims.admin) {
          setIsAdmin(true);
        }
      })
    }
  }, [user, loading, router]);

  const handleMakeAdmin = async () => {
    if (!firebaseApp || !user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to perform this action.",
        });
        return;
    }
    setIsSubmitting(true);
    
    const functions = getFunctions(firebaseApp);
    const makeFirstAdmin = httpsCallable(functions, 'makeFirstAdmin');

    try {
      await makeFirstAdmin();
      toast({
        title: "Success!",
        description: "Admin privileges granted. Please sign out and sign back in to access the admin panel.",
      });
      // Force refresh of the token to get new claims
      await getAuth().currentUser?.getIdToken(true);
      router.push('/admin');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred.",
        description: error.message || "Could not set admin claim.",
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Loading...</p>
            </div>
        </div>
    );
  }
  
  if (isAdmin) {
    return (
      <div>
          <PageHeader title="Claim Admin Access" subtitle="You are already an administrator."/>
          <main className="container mx-auto px-4 py-12 md:py-16">
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-green-500" /> Admin Status Confirmed</CardTitle>
                <CardDescription>Your account already has administrative privileges. You can access the admin panel now.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/admin')} className="w-full">
                  Go to Admin Panel
                </Button>
              </CardContent>
            </Card>
          </main>
      </div>
    );
  }

  return (
    <div>
        <PageHeader title="Claim Admin Access" subtitle="Become the first administrator for this application."/>
        <main className="container mx-auto px-4 py-12 md:py-16">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Become First Administrator</CardTitle>
              <CardDescription>Click the button below to grant your account administrative privileges. This is a one-time action and can only be performed if no other admins exist.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleMakeAdmin} disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Make Me Admin
                </Button>
            </CardContent>
          </Card>
        </main>
    </div>
  );
}
