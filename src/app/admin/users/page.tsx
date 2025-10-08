
'use client';
import { useState } from 'react';
import { useCollection, useUser, useFirebase } from '@/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Database, Upload, HeartHandshake, IndianRupee, Users, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UserProfile = {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    customClaims?: { [key: string]: any };
};

export default function UsersAdminPage() {
  const { user } = useUser();
  const { functions: functionsInstance } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const { data: users, loading } = useCollection<UserProfile>('users');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [targetRole, setTargetRole] = useState<'admin' | 'user'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSignOut = () => {
    getAuth().signOut();
    router.push('/');
  };

  const openConfirmationDialog = (user: UserProfile, role: 'admin' | 'user') => {
    setSelectedUser(user);
    setTargetRole(role);
    setIsAlertOpen(true);
  };
  
  const confirmRoleChange = async () => {
    if (!selectedUser || !functionsInstance) return;
    setIsSubmitting(true);
    
    const setUserRole = httpsCallable(functionsInstance, 'setUserRole');
    
    try {
        await setUserRole({ uid: selectedUser.uid, role: targetRole });
        toast({
            title: "Success",
            description: `${selectedUser.displayName}'s role has been updated to ${targetRole}.`,
        });
    } catch (error: any) {
        console.error("Error setting user role:", error);
        toast({
            variant: "destructive",
            title: "Role Change Failed",
            description: error.message || "Could not update user role.",
        });
    } finally {
        setIsSubmitting(false);
        setIsAlertOpen(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader><Logo /></SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Dashboard'}}><Link href="/admin"><Home /><span>Dashboard</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Users'}} isActive><Link href="/admin/users"><Users /><span>Users</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Clubs'}}><Link href="/admin/clubs"><BookOpen /><span>Clubs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Philanthropy'}}><Link href="/admin/philanthropy"><HeartHandshake /><span>Philanthropy</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Events'}}><Link href="/admin/events"><Calendar /><span>Events</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Gallery'}}><Link href="/admin/gallery"><GalleryHorizontal /><span>Gallery</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}}><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Database'}}><Link href="/admin/database"><Database /><span>Database</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Seed Data'}}><Link href="/admin/seed"><Upload /><span>Seed Data</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start p-2 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center">
            <LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">User Management</h1>
          </div>
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-8 w-8"><AvatarImage src={user.photoURL ?? ''} /><AvatarFallback>{user.displayName?.charAt(0) ?? 'A'}</AvatarFallback></Avatar>
              <span>{user.displayName}</span>
            </div>
          )}
        </header>
        <main className="flex-1 p-6">
            {loading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
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
                    {users.map((u) => (
                        <TableRow key={u.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={u.photoURL} alt={u.displayName} />
                                    <AvatarFallback>{u.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                                </Avatar>
                                {u.displayName}
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                                {u.customClaims?.admin ? (
                                    <Badge variant="secondary" className="bg-green-700/20 text-green-400 border-green-500/50">Admin</Badge>
                                ) : (
                                    <Badge variant="outline">User</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {u.customClaims?.admin ? (
                                    <Button size="sm" variant="destructive" onClick={() => openConfirmationDialog(u, 'user')} disabled={u.uid === user?.uid}>
                                        <ShieldOff className="mr-2 h-4 w-4" /> Revoke Admin
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => openConfirmationDialog(u, 'admin')}>
                                        <ShieldCheck className="mr-2 h-4 w-4" /> Make Admin
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            )}
        </main>
      </SidebarInset>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change the role for {selectedUser?.displayName} to <span className="font-bold">{targetRole}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </SidebarProvider>
  );
}
