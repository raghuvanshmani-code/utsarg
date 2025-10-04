'use client';
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

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
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/account');
        }
    }, [user, loading, router]);

    const auth = getAuth();

    const setupRecaptcha = () => {
        if (!recaptchaContainerRef.current) return;
        
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            'size': 'invisible',
            'callback': (response: any) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/account');
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const handlePhoneSignIn = async () => {
        if (!window.recaptchaVerifier) {
            setupRecaptcha();
        }
        const appVerifier = window.recaptchaVerifier!;
        try {
            const confirmationResult = await signInWithPhoneNumber(auth, `+${phoneNumber}`, appVerifier);
            window.confirmationResult = confirmationResult;
            setVerificationId('sent'); // Use a string to indicate OTP is sent
        } catch (error) {
            console.error("Error sending verification code", error);
        }
    };

    const handleVerifyCode = async () => {
        try {
            await window.confirmationResult.confirm(code);
            router.push('/account');
        } catch (error) {
            console.error("Error verifying code", error);
        }
    };

    if (loading || user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Choose your login method
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Button variant="outline" onClick={handleGoogleSignIn}>
                        Login with Google
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    {!verificationId ? (
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="+1 123 456 7890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                            <Button onClick={handlePhoneSignIn}>Send Code</Button>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                            <Button onClick={handleVerifyCode}>Verify Code</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div ref={recaptchaContainerRef}></div>
        </div>
    );
}
    