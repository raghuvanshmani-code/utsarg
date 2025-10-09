
'use client';
import { useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { GalleryImage } from '@/lib/types';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, MoreHorizontal, Pencil, Trash2, Loader2, Image as ImageIcon, HeartHandshake } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { GalleryForm } from '@/components/admin/gallery-form';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonEntryForm } from '@/components/admin/json-entry-form';

// Function to remove undefined values from an object
const sanitizeData = (obj: any) => {
  const newObj: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

export default function GalleryAdminPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: galleryItems, loading } = useCollection<GalleryImage>('gallery');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryImage | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = () => {
    getAuth().signOut();
    router.push('/');
  };

  const handleEdit = (item: GalleryImage) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (item: GalleryImage) => {
    setItemToDelete(item);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete || !db) return;
    
    setIsSubmitting(true);
    const docRef = doc(db, 'gallery', itemToDelete.id);
    
    deleteDoc(docRef).then(() => {
        toast({ title: "Success", description: "Gallery item deleted successfully." });
        setIsAlertOpen(false);
        setItemToDelete(null);
    }).catch(serverError => {
        console.error("Error deleting document: ", serverError);
        toast({ variant: 'destructive', title: "Error", description: serverError.message });
    }).finally(() => {
        setIsSubmitting(false);
    });
  };

  const handleFormSubmit = (values: any) => {
      if (!db) return;
      setIsSubmitting(true);
      
      const sanitizedValues = sanitizeData(values);
      const data = {
        ...sanitizedValues,
        uploadedBy: user?.uid ?? 'anonymous',
        updatedAt: serverTimestamp(),
      };

      if (selectedItem) {
          const docRef = doc(db, 'gallery', selectedItem.id);
          updateDoc(docRef, data).then(() => {
              toast({ title: "Success", description: "Gallery item updated successfully." });
              setIsDialogOpen(false);
          }).catch(serverError => {
              console.error("Error updating document: ", serverError);
              toast({ variant: 'destructive', title: "Error", description: serverError.message });
          }).finally(() => {
              setIsSubmitting(false);
          });
      } else {
          const collectionRef = collection(db, 'gallery');
          addDoc(collectionRef, { ...data, createdAt: serverTimestamp(), date: new Date().toISOString() }).then(() => {
              toast({ title: "Success", description: "Gallery item added successfully." });
          }).catch(serverError => {
              console.error("Error adding document: ", serverError);
              toast({ variant: 'destructive', title: "Error", description: serverError.message });
          }).finally(() => {
              setIsSubmitting(false);
          });
      }
  };

  const handleJsonSubmit = async (jsonContent: string) => {
    if (!db) return;
    setIsSubmitting(true);
    try {
        const items = JSON.parse(jsonContent);
        if (!Array.isArray(items)) {
            throw new Error("JSON content must be an array of objects.");
        }
        
        const collectionRef = collection(db, 'gallery');
        for (const item of items) {
            const sanitizedItem = sanitizeData(item);
            await addDoc(collectionRef, { 
                ...sanitizedItem, 
                uploadedBy: user?.uid ?? 'anonymous',
                date: new Date().toISOString(),
                createdAt: serverTimestamp(), 
                updatedAt: serverTimestamp() 
            });
        }
        toast({ title: "Success", description: `${items.length} gallery items added successfully.` });
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
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Clubs'}}><Link href="/admin/clubs"><BookOpen /><span>Clubs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Philanthropy'}}><Link href="/admin/philanthropy"><HeartHandshake /><span>Philanthropy</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Events'}}><Link href="/admin/events"><Calendar /><span>Events</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Gallery'}} isActive><Link href="/admin/gallery"><GalleryHorizontal /><span>Gallery</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}}><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={handleSignOut} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1 flex justify-between items-center"><h1 className="text-lg font-semibold">Gallery Management</h1></div>
          {user && (<div className="flex items-center gap-2 text-sm"><Avatar className="h-8 w-8"><AvatarImage src={user.photoURL ?? ''} /><AvatarFallback>{user.displayName?.charAt(0) ?? 'A'}</AvatarFallback></Avatar><span>{user.displayName}</span></div>)}
        </header>
        <main className="flex-1 p-6 space-y-6">
            <Card>
                <CardHeader><CardTitle>Add Gallery Items</CardTitle><CardDescription>Add a single item via the form or multiple items via JSON.</CardDescription></CardHeader>
                <CardContent>
                    <Tabs defaultValue="manual">
                        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="manual">Manual Entry</TabsTrigger><TabsTrigger value="json">JSON Input</TabsTrigger></TabsList>
                        <TabsContent value="manual" className="pt-4"><GalleryForm item={null} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} /></TabsContent>
                        <TabsContent value="json" className="pt-4"><JsonEntryForm entityName="Gallery Item" onSubmit={handleJsonSubmit} isSubmitting={isSubmitting} /></TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Manage Gallery</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>) : (
                    <Table>
                        <TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Caption</TableHead><TableHead>Tags</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {galleryItems.map((item) => (<TableRow key={item.id}><TableCell>{item.url && (item.url.startsWith('http://') || item.url.startsWith('https://')) ? (<Image src={item.url} alt={item.caption || 'Gallery Image'} width={64} height={64} className="rounded-md object-cover" />) : (<div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>)}</TableCell><TableCell className="font-medium">{item.caption}</TableCell><TableCell>{item.tags?.join(', ')}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={() => handleEdit(item)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(item)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </main>
      </SidebarInset>

      <GalleryForm isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleFormSubmit} item={selectedItem} isSubmitting={isSubmitting} isDialog={true} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this item from the gallery.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
