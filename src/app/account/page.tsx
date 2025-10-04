'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAuth } from 'firebase/auth';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export default function AccountPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const checkAdmin = async () => {
            if(user) {
                const idTokenResult = await user.getIdTokenResult();
                setIsAdmin(!!idTokenResult.claims.admin);
            }
        };
        checkAdmin();
    }, [user]);

    const handleSignOut = () => {
        getAuth().signOut();
        router.push('/');
    };

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="My Account" subtitle="Manage your account details and preferences."/>
            <div className="container mx-auto px-4 py-12 md:py-16">
                <Card className="mx-auto max-w-lg">
                    <CardHeader className="text-center">
                        {isAdmin && (
                            <div className="flex justify-center mb-4">
                                <Badge variant="secondary" className="text-lg bg-green-700/20 text-green-400 border-green-500/50">
                                    <ShieldCheck className="mr-2 h-5 w-5" />
                                    Admin Access
                                </Badge>
                            </div>
                        )}
                        <Avatar className="mx-auto h-24 w-24 mb-4">
                            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                            <AvatarFallback>
                                {user.displayName ? user.displayName.charAt(0) : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-2xl">{user.displayName || 'User'}</CardTitle>
                        <CardDescription>{user.email || user.phoneNumber}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        {/* Add more account details here */}
                        <Button onClick={handleSignOut} variant="destructive" className="mt-6">
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
