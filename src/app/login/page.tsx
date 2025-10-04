'use client';
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: any;
    }
}

export default function LoginPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/account');
        }
    }, [user, loading, router]);

    const auth = getAuth();

    const setupRecaptcha = () => {
        if (!recaptchaContainerRef.current) return;
        if (window.recaptchaVerifier) return;
        
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            'size': 'invisible',
            'callback': (response: any) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                console.log("reCAPTCHA solved");
            }
        });
    };
    
    useEffect(() => {
        setupRecaptcha();
    }, [auth]);


    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/account');
        } catch (error: any) {
            console.error("Error signing in with Google", error);
            toast({
              variant: "destructive",
              title: "Sign-in Failed",
              description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePhoneSignIn = async () => {
        setIsSubmitting(true);
        if (!window.recaptchaVerifier) {
            setupRecaptcha();
        }
        const appVerifier = window.recaptchaVerifier!;
        try {
            // Firebase requires the phone number in E.164 format.
            const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            setVerificationId('sent'); // Use a string to indicate OTP is sent
            toast({
              title: "Code Sent",
              description: "A verification code has been sent to your phone.",
            });
        } catch (error: any) {
            console.error("Error sending verification code", error);
            toast({
              variant: "destructive",
              title: "Failed to Send Code",
              description: error.message,
            });
            // Reset reCAPTCHA so user can try again.
            window.recaptchaVerifier?.render().then((widgetId) => {
              if (auth) {
                window.grecaptcha.reset(widgetId);
              }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyCode = async () => {
        setIsSubmitting(true);
        if (!window.confirmationResult) {
            console.error("No confirmation result found");
            setIsSubmitting(false);
            return;
        }
        try {
            await window.confirmationResult.confirm(code);
            router.push('/account');
        } catch (error: any) {
            console.error("Error verifying code", error);
             toast({
              variant: "destructive",
              title: "Invalid Code",
              description: "The code you entered is incorrect. Please try again.",
            });
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
                            Choose your preferred method to sign in or create an account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <Button variant="outline" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 398.8 0 261.8S111.8 11.6 244 11.6C303.1 11.6 354.1 33.4 391.1 66.4l-58.8 58.8C308.1 100.8 277.9 89.9 244 89.9c-88.5 0-160.2 71.7-160.2 160.2s71.7 160.2 160.2 160.2c74.7 0 123.3-46.5 133.3-108.3H244v-75h244.1c1.2 6.9 1.9 14.1 1.9 21.8z"></path></svg>}
                            Continue with Google
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        {!verificationId ? (
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="e.g., 911234567890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                                    <CardDescription className="text-xs">
                                        Include your country code without the '+'.
                                    </CardDescription>
                                </div>
                                <Button onClick={handlePhoneSignIn} disabled={isSubmitting || !phoneNumber}>
                                     {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Send Code
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input id="code" type="text" placeholder="Enter the 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} required />
                                <Button onClick={handleVerifyCode} disabled={isSubmitting || !code}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Verify Code
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div ref={recaptchaContainerRef}></div>
        </div>
    );
}