'use client';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/layout/logo';

export default function LoginPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const loginImage = PlaceHolderImages.find(p => p.id === 'about-banner');

    useEffect(() => {
        if (!loading && user) {
            router.push('/account');
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/account');
        } catch (error: any) {
            console.error("Error signing in with Google", error);
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
          <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-[350px] gap-8">
                    <div className="grid gap-4 text-center">
                        <div className="flex justify-center">
                            <Logo />
                        </div>
                        <h1 className="text-3xl font-bold font-headline text-primary">
                            Welcome to UTSARG
                        </h1>
                        <p className="text-muted-foreground">
                            Sign in to continue to the student hub.
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <Button variant="outline" onClick={handleGoogleSignIn} disabled={isSubmitting} size="lg">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 398.8 0 261.8S111.8 11.6 244 11.6C303.1 11.6 354.1 33.4 391.1 66.4l-58.8 58.8C308.1 100.8 277.9 89.9 244 89.9c-88.5 0-160.2 71.7-160.2 160.2s71.7 160.2 160.2 160.2c74.7 0 123.3-46.5 133.3-108.3H244v-75h244.1c1.2 6.9 1.9 14.1 1.9 21.8z"></path></svg>}
                            Continue with Google
                        </Button>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
            <div className="hidden lg:block relative">
                {loginImage && (
                    <Image
                        src={loginImage.imageUrl}
                        alt="UTSARG college campus"
                        fill
                        className="object-cover"
                        data-ai-hint={loginImage.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-black/60" />
            </div>
        </div>
    );
}
