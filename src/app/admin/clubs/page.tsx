
'use client';
import { useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Club } from '@/lib/types';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Home, Users, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Database, PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ClubForm } from '@/components/admin/club-form';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export default function ClubsAdminPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: clubs, loading, error } = useCollection<Club>('clubs');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = () => {
    getAuth().signOut();
    router.push('/');
  };

  const handleAddNew = () => {
    setSelectedClub(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (club: Club) => {
    setSelectedClub(club);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (club: Club) => {
    setClubToDelete(club);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!clubToDelete || !db) return;
    
    setIsSubmitting(true);
    const docRef = doc(db, 'clubs', clubToDelete.id);
    
    deleteDoc(docRef).then(() => {
        toast({ title: "Success", description: "Club deleted successfully." });
        setIsAlertOpen(false);
        setClubToDelete(null);
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsSubmitting(false);
    });
  };

  const handleFormSubmit = async (values: any) => {
      if (!db) return;
      setIsSubmitting(true);
      
      try {
        if (selectedClub) {
            // Update existing club
            const docRef = doc(db, 'clubs', selectedClub.id);
            await updateDoc(docRef, values);
            toast({ title: "Success", description: "Club updated successfully." });
        } else {
            // Add new club
            const collectionRef = collection(db, 'clubs');
            await addDoc(collectionRef, values);
            toast({ title: "Success", description: "Club added successfully." });
        }
        setIsDialogOpen(false);
        setSelectedClub(null);
      } catch (error) {
         toast({ variant: 'destructive', title: "Error", description: "An error occurred." });
         console.error(error);
      } finally {
        setIsSubmitting(false);
      }
  };


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{children: 'Dashboard'}}>
                <Link href="/admin"><Home /><span>Dashboard</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{children: 'Users'}}>
                <Link href="/admin/users"><Users /><span>Users</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Clubs'}} isActive>
                    <Link href="/admin/clubs"><BookOpen /><span>Clubs</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{children: 'Events'}}>
                    <Calendar />
                    <span>Events</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{children: 'Gallery'}}>
                    <GalleryHorizontal />
                    <span>Gallery</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{children: 'Blog'}}>
                    <Newspaper />
                    <span>Blog</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Database'}}>
                    <Link href="/admin/database"><Database /><span>Database</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2">
                <LogOut className="h-5 w-5" /> 
                <span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-lg font-semibold">Clubs Management</h1>
             <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Club
            </Button>
          </div>
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL ?? ''} />
                <AvatarFallback>{user.displayName?.charAt(0) ?? 'A'}</AvatarFallback>
              </Avatar>
              <span>{user.displayName}</span>
            </div>
          )}
        </header>
        <main className="flex-1 p-6">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clubs.map((club) => (
                        <TableRow key={club.id}>
                            <TableCell className="font-medium">{club.name}</TableCell>
                            <TableCell className="max-w-md truncate">{club.description}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEdit(club)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(club)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            )}
        </main>
      </SidebarInset>

      <ClubForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleFormSubmit}
        club={selectedClub}
        isSubmitting={isSubmitting}
       />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the club
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </SidebarProvider>
  );
}
