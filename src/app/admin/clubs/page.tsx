
'use client';
import { useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { Club } from '@/lib/types';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, MoreHorizontal, Pencil, Trash2, Loader2, HeartHandshake, ShieldQuestion } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ClubForm } from '@/components/admin/club-form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonEntryForm } from '@/components/admin/json-entry-form';
import { useAdminAuth } from '../auth-provider';
import { createAdminLog } from '@/lib/admin-logs';
import { AdminHeader } from '@/components/admin/admin-header';

export default function ClubsAdminPage() {
  const { username, logout } = useAdminAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: clubs, loading } = useCollection<Club>('clubs');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (club: Club) => {
    setSelectedClub(club);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (club: Club) => {
    setClubToDelete(club);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!clubToDelete || !db || !username) return;
    
    setIsSubmitting(true);
    const docRef = doc(db, 'clubs', clubToDelete.id);
    
    try {
        await deleteDoc(docRef);
        await createAdminLog(db, {
            username,
            action: 'delete',
            collection: 'clubs',
            docId: clubToDelete.id,
            details: `Deleted club: ${clubToDelete.name}`
        });
        toast({ title: "Success", description: "Club deleted successfully." });
    } catch(e) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete club." });
    } finally {
        setIsAlertOpen(false);
        setClubToDelete(null);
        setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (values: any) => {
      if (!db || !username) return;
      setIsSubmitting(true);
      
      const data = { ...values, updatedAt: serverTimestamp() };

      try {
        if (selectedClub) {
            const docRef = doc(db, 'clubs', selectedClub.id);
            await updateDoc(docRef, data);
            await createAdminLog(db, {
                username,
                action: 'update',
                collection: 'clubs',
                docId: selectedClub.id,
                details: `Updated club: ${values.name}`
            });
            toast({ title: "Success", description: "Club updated successfully." });
            setIsDialogOpen(false);
        } else {
            const collectionRef = collection(db, 'clubs');
            const newDoc = await addDoc(collectionRef, { ...data, createdAt: serverTimestamp() });
            await createAdminLog(db, {
                username,
                action: 'create',
                collection: 'clubs',
                docId: newDoc.id,
                details: `Created club: ${values.name}`
            });
            toast({ title: "Success", description: "Club added successfully." });
        }
      } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "An error occurred." });
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleJsonSubmit = async (jsonContent: string) => {
    if (!db || !username) return;
    setIsSubmitting(true);
    try {
        const items = JSON.parse(jsonContent);
        if (!Array.isArray(items)) {
            throw new Error("JSON content must be an array of objects.");
        }
        
        const collectionRef = collection(db, 'clubs');
        for (const item of items) {
            await addDoc(collectionRef, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }

        await createAdminLog(db, {
            username,
            action: 'json-batch-import',
            collection: 'clubs',
            details: `Added ${items.length} clubs via JSON.`
        });
        toast({ title: "Success", description: `${items.length} clubs added successfully.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "JSON Error", description: e.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader><div className="flex items-center gap-2"><Logo /></div></SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Dashboard'}}><Link href="/admin"><Home /><span>Dashboard</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Clubs'}} isActive><Link href="/admin/clubs"><BookOpen /><span>Clubs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Philanthropy'}}><Link href="/admin/philanthropy"><HeartHandshake /><span>Philanthropy</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Events'}}><Link href="/admin/events"><Calendar /><span>Events</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Gallery'}}><Link href="/admin/gallery"><GalleryHorizontal /><span>Gallery</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}}><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'System Logs'}}><Link href="/admin/logs"><ShieldQuestion /><span>System Logs</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader title="Clubs Management" />
        <main className="flex-1 p-6 space-y-6">
            <Card>
                <CardHeader><CardTitle>Add Clubs</CardTitle><CardDescription>Add a single club via the form or multiple clubs via JSON.</CardDescription></CardHeader>
                <CardContent>
                    <Tabs defaultValue="manual">
                        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="manual">Manual Entry</TabsTrigger><TabsTrigger value="json">JSON Input</TabsTrigger></TabsList>
                        <TabsContent value="manual" className="pt-4"><ClubForm club={null} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} /></TabsContent>
                        <TabsContent value="json" className="pt-4"><JsonEntryForm entityName="Club" onSubmit={handleJsonSubmit} isSubmitting={isSubmitting} /></TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Manage Clubs</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>) : (
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {clubs.map((club) => (<TableRow key={club.id}><TableCell className="font-medium">{club.name}</TableCell><TableCell className="max-w-md truncate">{club.description}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={() => handleEdit(club)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(club)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </main>
      </SidebarInset>

      <ClubForm isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleFormSubmit} club={selectedClub} isSubmitting={isSubmitting} isDialog={true} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the club and remove its data from our servers.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
