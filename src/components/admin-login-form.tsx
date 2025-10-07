'use client';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Logo } from '@/components/layout/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminLoginForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async (provider: 'google' | 'password') => {
        setIsSubmitting(true);
        const auth = getAuth();
        try {
            if (provider === 'google') {
                await signInWithPopup(auth, new GoogleAuthProvider());
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
             router.refresh(); 
        } catch (error: any) {
            console.error(`Error signing in with ${provider}`, error);
            let description = "An unknown error occurred.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                description = "Invalid email or password. Please try again.";
            } else if (error.code !== 'auth/popup-closed-by-user') {
                description = error.message;
            }

            if (error.code !== 'auth/popup-closed-by-user') {
                toast({
                    variant: "destructive",
                    title: "Sign-in Failed",
                    description: description,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl font-bold font-headline">Admin Access Required</CardTitle>
                    <CardDescription>
                        You must be an administrator to access this panel. Please sign in.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button onClick={() => handleSignIn('password')} disabled={isSubmitting} className="w-full">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign in with Email
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => handleSignIn('google')} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 398.8 0 261.8S111.8 11.6 244 11.6C303.1 11.6 354.1 33.4 391.1 66.4l-58.8 58.8C308.1 100.8 277.9 89.9 244 89.9c-88.5 0-160.2 71.7-160.2 160.2s71.7 160.2 160.2 160.2c74.7 0 123.3-46.5 133.3-108.3H244v-75h244.1c1.2 6.9 1.9 14.1 1.9 21.8z"></path></svg>}
                            Sign in with Google
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
