
'use client';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, Unsubscribe } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/layout/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser } from '@/firebase';

const signInSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export function AdminLoginForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { isAdmin, user } = useUser();

    const signInForm = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const handleLoginAttempt = (method: 'google' | 'password', values?: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true);
        const auth = getAuth();
        let authPromise;

        if (method === 'google') {
            const provider = new GoogleAuthProvider();
            authPromise = signInWithPopup(auth, provider);
        } else if (values) {
            authPromise = signInWithEmailAndPassword(auth, values.email, values.password);
        } else {
            setIsSubmitting(false);
            return;
        }

        authPromise.then(userCredential => {
            // After successful sign-in, we need to check their claims.
            return userCredential.user.getIdTokenResult();
        }).then(idTokenResult => {
            if (!idTokenResult.claims.admin) {
                // User signed in, but is not an admin.
                toast({
                    variant: "destructive",
                    title: "Permission Denied",
                    description: "You do not have the required permissions to access the admin panel.",
                });
                auth.signOut(); // Sign them out immediately.
            }
            // If they are an admin, the AdminAuthProvider will handle the redirect.
        }).catch((error: any) => {
             if (error.code !== 'auth/popup-closed-by-user') {
                let description = "An unknown error occurred during sign-in.";
                 if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    description = "Invalid email or password. Please try again.";
                 } else {
                    description = error.message;
                 }
              toast({
                variant: "destructive",
                title: "Sign-in Failed",
                description: description,
              });
            }
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Panel Access</CardTitle>
                    <CardDescription>
                        You must be an authorized admin to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Button variant="outline" onClick={() => handleLoginAttempt('google')} disabled={isSubmitting} className='w-full'>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 398.8 0 261.8S111.8 11.6 244 11.6C303.1 11.6 354.1 33.4 391.1 66.4l-58.8 58.8C308.1 100.8 277.9 89.9 244 89.9c-88.5 0-160.2 71.7-160.2 160.2s71.7 160.2 160.2 160.2c74.7 0 123.3-46.5 133.3-108.3H244v-75h244.1c1.2 6.9 1.9 14.1 1.9 21.8z"></path></svg>}
                            Sign in with Google
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">Use this if your admin account is a Google account.</p>
                    </div>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>
                     <Form {...signInForm}>
                        <form onSubmit={signInForm.handleSubmit((values) => handleLoginAttempt('password', values))} className="space-y-4">
                            <FormField control={signInForm.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="admin@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={signInForm.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign In
                            </Button>
                        </form>
                    </Form>
                     <p className="text-xs text-center text-muted-foreground pt-2">Use this if your admin account was set up with an email and password.</p>
                </CardContent>
            </Card>
        </div>
    );
}
