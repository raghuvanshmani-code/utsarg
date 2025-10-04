'use client';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/account');
        }
    }, [user, loading, router]);

    const auth = getAuth();

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/account');
        } catch (error: any) {
            console.error("Error signing in with Google", error);
            // Don't show toast for user closing popup
            if (error.code !== 'auth/popup-closed-by-user') {
              toast({
                variant: "destructive",
                title: "Sign-in Failed",
                description: error.message,
              });
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading || user) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

    return (
        <div>
            <PageHeader title="Login or Sign Up" subtitle="Join the UTSARG community to get involved."/>
            <div className="container mx-auto px-4 py-12 md:py-16">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Welcome</CardTitle>
                        <CardDescription>
                            Sign in or create an account to get started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <Button variant="outline" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 398.8 0 261.8S111.8 11.6 244 11.6C303.1 11.6 354.1 33.4 391.1 66.4l-58.8 58.8C308.1 100.8 277.9 89.9 244 89.9c-88.5 0-160.2 71.7-160.2 160.2s71.7 160.2 160.2 160.2c74.7 0 123.3-46.5 133.3-108.3H244v-75h244.1c1.2 6.9 1.9 14.1 1.9 21.8z"></path></svg>}
                            Continue with Google
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
