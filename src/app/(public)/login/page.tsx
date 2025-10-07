
'use client';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Logo } from '@/components/layout/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Confetti from 'react-confetti';

const signUpSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signInSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const loginImage = "https://res.cloudinary.com/dsot9i4o6/image/upload/v1759768678/62387705-8e60-47c6-9b17-2fb7db181511_swpmpc.jpg";

    const signUpForm = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const signInForm = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });
    
    useEffect(() => {
        if (!loading && user) {
            setShowConfetti(true);
            const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';
            setTimeout(() => router.push(redirectPath), 3000);
        }
    }, [user, loading, router]);


    const handleSuccessfulLogin = () => {
        setShowConfetti(true);
    };

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            handleSuccessfulLogin();
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

    const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            await updateProfile(userCredential.user, { displayName: values.name });
            // Manually refresh token to ensure custom claims from onCreate trigger are available if needed.
            await userCredential.user.getIdToken(true);
            handleSuccessfulLogin();
        } catch (error: any) {
            console.error("Error signing up", error);
            let description = error.message;
            if (error.code === 'auth/email-already-in-use') {
                description = "An account with this email already exists. Please use the 'Sign In' tab instead.";
            }
            toast({
                variant: "destructive",
                title: "Sign-up Failed",
                description: description,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true);
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            handleSuccessfulLogin();
        } catch (error: any) {
            console.error("Error signing in", error);
            let description = "An unknown error occurred.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                description = "Invalid email or password. Please try again or sign up if you don't have an account.";
            }
             toast({
                variant: "destructive",
                title: "Sign-in Failed",
                description: description,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }
    
    if (showConfetti) {
        return <Confetti recycle={false} numberOfPieces={500} />;
    }

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {showConfetti && <Confetti recycle={false} />}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-[380px] gap-8">
                    <div className="grid gap-4 text-center">
                        <div className="flex justify-center">
                            <Logo />
                        </div>
                        <h1 className="text-3xl font-bold text-primary">
                            Welcome to UTSARG
                        </h1>
                        <p className="text-muted-foreground">
                           Sign in or create an account to join the hub.
                        </p>
                    </div>

                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="signin">
                            <Card className="border-none shadow-none">
                                <CardContent className="space-y-4 pt-6">
                                     <Form {...signInForm}>
                                        <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                                            <FormField control={signInForm.control} name="email" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl><Input placeholder="m@example.com" {...field} /></FormControl>
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
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="signup">
                            <Card className="border-none shadow-none">
                                <CardContent className="space-y-4 pt-6">
                                    <Form {...signUpForm}>
                                        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                                            <FormField control={signUpForm.control} name="name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            <FormField control={signUpForm.control} name="email" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl><Input placeholder="m@example.com" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            <FormField control={signUpForm.control} name="password" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl><Input type="password" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign Up
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    
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

                    <Button variant="outline" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 398.8 0 261.8S111.8 11.6 244 11.6C303.1 11.6 354.1 33.4 391.1 66.4l-58.8 58.8C308.1 100.8 277.9 89.9 244 89.9c-88.5 0-160.2 71.7-160.2 160.2s71.7 160.2 160.2 160.2c74.7 0 123.3-46.5 133.3-108.3H244v-75h244.1c1.2 6.9 1.9 14.1 1.9 21.8z"></path></svg>}
                        Google
                    </Button>
                </div>
            </div>
            <div className="hidden lg:block relative">
                <Image
                    src={loginImage}
                    alt="UTSARG college campus"
                    fill
                    className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>
        </div>
    );
}
