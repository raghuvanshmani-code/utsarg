'use client';
import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { useUser, useFirebaseApp } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function MakeAdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email ?? "",
    },
  });

   useEffect(() => {
    if (user?.email) {
      form.setValue("email", user.email);
    }
  }, [user, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firebaseApp || !user) return;
    setIsSubmitting(true);
    
    // Ensure the email matches the logged-in user's email for security
    if(values.email !== user.email) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You can only claim admin access for your own account.",
        });
        setIsSubmitting(false);
        return;
    }

    const functions = getFunctions(firebaseApp);
    const setAdminClaim = httpsCallable(functions, 'setAdminClaim');

    try {
      const result = await setAdminClaim({ email: values.email });
      const data = result.data as { message?: string; error?: string };
      if (data.error) {
        throw new Error(data.error);
      }
      toast({
        title: "Success!",
        description: "Admin privileges granted. Please sign out and sign back in to access the admin panel.",
      });
      form.reset();
      router.push('/account');
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

  return (
    <div>
        <PageHeader title="Claim Admin Access" subtitle="Use this form to grant yourself initial administrative privileges."/>
        <main className="container mx-auto px-4 py-12 md:py-16">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Grant Admin Privileges</CardTitle>
              <CardDescription>If you are the designated first administrator, confirm your email below to claim your role. Your email must be logged in.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-end gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-grow w-full">
                        <FormLabel>Your Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Claim Admin Role
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
    </div>
  );
}
