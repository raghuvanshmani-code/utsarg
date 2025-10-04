'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { PageHeader } from '@/components/page-header';

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
        return <div>Loading...</div>;
    }

    return (
        <div>
            <PageHeader title="My Account" subtitle="Manage your account details and preferences."/>
            <div className="container mx-auto px-4 py-12 md:py-16">
                <Card className="mx-auto max-w-lg">
                    <CardHeader className="text-center">
                        <Avatar className="mx-auto h-24 w-24 mb-4">
                            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                            <AvatarFallback>
                                {user.displayName ? user.displayName.charAt(0) : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-2xl">{user.displayName || 'User'}</CardTitle>
                        <CardDescription>{user.email || user.phoneNumber}</CardDescription>
                        {isAdmin && <CardDescription className="text-primary font-bold">Admin</CardDescription>}
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

    