
'use client';
import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Loader2, HeartHandshake, ShieldQuestion, CloudUpload, Settings, Database, Users as UsersIcon, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { useAdminAuth } from '../../auth-provider';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFunctions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type UserProfile = {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  customClaims?: { admin?: boolean };
};

export default function UsersPage() {
  const { logout } = useAdminAuth();
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
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Settings'}} isActive><Link href="/admin/settings/deploy"><Settings /><span>Settings</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader title="Settings" />
        <main className="flex-1 p-6 space-y-6">
           <Tabs defaultValue="users" className="w-full">
              <TabsList>
                 <TabsTrigger value="deploy" asChild>
                    <Link href="/admin/settings/deploy">
                        <CloudUpload className="mr-2 h-4 w-4"/> Deploy Rules
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="seed" asChild>
                    <Link href="/admin/settings/seed-data">
                        <Database className="mr-2 h-4 w-4"/> Seed Data
                    </Link>
                </TabsTrigger>
                 <TabsTrigger value="users">
                    <UsersIcon className="mr-2 h-4 w-4"/> User Management
                </TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="pt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                            View all registered users and manage their roles. The `admin` role grants permission to access this admin panel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       {usersLoading ? (
                           <div className="flex justify-center items-center h-40">
                               <Loader2 className="h-8 w-8 animate-spin" />
                           </div>
                       ) : (
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
                                   {users.map(user => (
                                       <TableRow key={user.uid}>
                                           <TableCell className="font-medium flex items-center gap-2">
                                               <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.photoURL ?? undefined} />
                                                    <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                                               </Avatar>
                                               {user.displayName}
                                           </TableCell>
                                           <TableCell>{user.email}</TableCell>
                                           <TableCell>
                                                {user.customClaims?.admin ? (
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
                                                       <Button size="sm" variant="ghost" disabled={isSubmitting === user.uid}>
                                                          {isSubmitting === user.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actions'}
                                                       </Button>
                                                   </DropdownMenuTrigger>
                                                   <DropdownMenuContent>
                                                       {user.customClaims?.admin ? (
                                                            <DropdownMenuItem onClick={() => setUserRole(user.uid, 'user')} disabled={isSubmitting === user.uid}>Remove Admin Role</DropdownMenuItem>
                                                       ) : (
                                                            <DropdownMenuItem onClick={() => setUserRole(user.uid, 'admin')} disabled={isSubmitting === user.uid}>Make Admin</DropdownMenuItem>
                                                       )}
                                                   </DropdownMenuContent>
                                               </DropdownMenu>
                                           </TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                       )}
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
