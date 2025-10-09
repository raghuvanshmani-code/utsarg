
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/layout/logo';
import { Loader2 } from 'lucide-react';

const ADMIN_PASSWORD_SESSION_KEY = 'admin-authenticated';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
const APPROVED_ADMIN_EMAILS = ['raghuvanshmani@gmail.com'];

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isEmailApproved = APPROVED_ADMIN_EMAILS.includes(email.toLowerCase());

    if (password === ADMIN_PASSWORD && isEmailApproved) {
      sessionStorage.setItem(ADMIN_PASSWORD_SESSION_KEY, 'true');
      toast({
        title: 'Success',
        description: 'Login successful. Redirecting to dashboard...',
      });
      router.push('/admin');
    } else if (password === ADMIN_PASSWORD && !isEmailApproved) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'You are not authorized to access this panel.',
      });
      setIsSubmitting(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Incorrect email or password. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Logo />
            </div>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
