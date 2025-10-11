
'use client';
import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Loader2, HeartHandshake, ShieldQuestion, Settings, Users as UsersIcon, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { useAdminAuth } from '../../auth-provider';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFunctions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { User } from 'firebase/auth';

type UserProfile = {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  customClaims?: { admin?: boolean };
};

function UserTable({ adminUser }: { adminUser: User }) {
  const functions = useFunctions();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(''); // Store UID of user being updated

  const { data: users, loading: usersLoading } = useCollection<UserProfile>('users');

  const setUserRole = async (uid: string, role: 'admin' | 'user') => {
    if (!functions) {
      toast({ variant: 'destructive', title: 'Error', description: 'Functions not available.' });
      return;
    }
    
    setIsSubmitting(uid);
    const setUserRoleCallable = httpsCallable(functions, 'setUserRole');
    try {
      await setUserRoleCallable({ uid, role });
      toast({ title: 'Success', description: `User role updated to ${role}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSubmitting('');
    }
  };

  if (usersLoading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  if (!usersLoading && users.length === 0) {
      return (
          <div className="text-center py-10">
              <p className="text-muted-foreground">No users found in the database.</p>
              <p className="text-sm text-muted-foreground mt-2">New users will appear here after they sign up to the application.</p>
          </div>
      );
  }

  return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {users.map(userProfile => (
                <TableRow key={userProfile.uid}>
                    <TableCell className="font-medium flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={userProfile.photoURL ?? undefined} />
                            <AvatarFallback>{userProfile.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                        </Avatar>
                        {userProfile.displayName}
                    </TableCell>
                    <TableCell>{userProfile.email}</TableCell>
                    <TableCell>
                        {userProfile.customClaims?.admin ? (
                            <Badge variant="secondary" className="text-green-400 bg-green-900/50 border-green-500/30">
                                <ShieldCheck className="mr-1 h-3 w-3" />
                                Admin
                            </Badge>
                        ) : (
                            <Badge variant="outline">User</Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" disabled={isSubmitting === userProfile.uid || userProfile.uid === adminUser.uid}>
                                  {isSubmitting === userProfile.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actions'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {userProfile.uid === adminUser.uid ? (
                                     <DropdownMenuItem disabled>Cannot change own role</DropdownMenuItem>
                                ) : userProfile.customClaims?.admin ? (
                                     <DropdownMenuItem onClick={() => setUserRole(userProfile.uid, 'user')} disabled={isSubmitting === userProfile.uid}>Remove Admin Role</DropdownMenuItem>
                                ) : (
                                     <DropdownMenuItem onClick={() => setUserRole(userProfile.uid, 'admin')} disabled={isSubmitting === userProfile.uid}>Make Admin</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
  );
}

export default function UsersPage() {
  const { logout, user } = useAdminAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader><div className="flex items-center gap-2"><Logo /></div></SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Dashboard'}}><Link href="/admin"><Home /><span>Dashboard</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Clubs'}}><Link href="/admin/clubs"><BookOpen /><span>Clubs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Philanthropy'}}><Link href="/admin/philanthropy"><HeartHandshake /><span>Philanthropy</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Events'}}><Link href="/admin/events"><Calendar /><span>Events</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Gallery'}}><Link href="/admin/gallery"><GalleryHorizontal /><span>Gallery</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}}><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'System Logs'}}><Link href="/admin/logs"><ShieldQuestion /><span>System Logs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Settings'}} isActive><Link href="/admin/settings/users"><Settings /><span>Settings</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader title="Settings" />
        <main className="flex-1 p-6 space-y-6">
           <Card>
              <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                      View all registered users and manage their roles. The `admin` role grants permission to access this admin panel.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                 {user ? <UserTable adminUser={user} /> :  <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>}
              </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
