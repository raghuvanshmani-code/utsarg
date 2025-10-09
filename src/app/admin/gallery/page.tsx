
'use client';
import { useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { GalleryImage } from '@/lib/types';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, MoreHorizontal, Pencil, Trash2, Loader2, Image as ImageIcon, HeartHandshake, ShieldQuestion, Settings } from "lucide-react";
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
import { useAdminAuth } from '../auth-provider';
import { createAdminLog } from '@/lib/admin-logs';
import { AdminHeader } from '@/components/admin/admin-header';

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
  const { username, logout } = useAdminAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: galleryItems, loading } = useCollection<GalleryImage>('gallery');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryImage | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (item: GalleryImage) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (item: GalleryImage) => {
    setItemToDelete(item);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !db || !username) return;
    
    setIsSubmitting(true);
    const docRef = doc(db, 'gallery', itemToDelete.id);
    
    try {
        await deleteDoc(docRef);
        await createAdminLog(db, {
            username,
            action: 'delete',
            collection: 'gallery',
            docId: itemToDelete.id,
            details: `Deleted gallery item: ${itemToDelete.caption || itemToDelete.id}`
        });
        toast({ title: "Success", description: "Gallery item deleted successfully." });
    } catch(e: any) {
        console.error("Delete error:", e);
        toast({ variant: "destructive", title: "Error", description: e.message || "Failed to delete gallery item." });
    } finally {
        setIsAlertOpen(false);
        setItemToDelete(null);
        setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (values: any) => {
      if (!db || !username) return;
      setIsSubmitting(true);
      
      const sanitizedValues = sanitizeData(values);
      const data = {
        ...sanitizedValues,
        uploadedBy: username,
        updatedAt: serverTimestamp(),
      };

      try {
        if (selectedItem) {
            const docRef = doc(db, 'gallery', selectedItem.id);
            await updateDoc(docRef, data);
            await createAdminLog(db, {
                username,
                action: 'update',
                collection: 'gallery',
                docId: selectedItem.id,
                details: `Updated gallery item: ${values.caption || selectedItem.id}`
            });
            toast({ title: "Success", description: "Gallery item updated successfully." });
            setIsDialogOpen(false);
        } else {
            const collectionRef = collection(db, 'gallery');
            const newDoc = await addDoc(collectionRef, { ...data, createdAt: serverTimestamp(), date: new Date().toISOString() });
            await createAdminLog(db, {
                username,
                action: 'create',
                collection: 'gallery',
                docId: newDoc.id,
                details: `Created gallery item: ${values.caption || newDoc.id}`
            });
            toast({ title: "Success", description: "Gallery item added successfully." });
        }
      } catch(e: any) {
        console.error("Form submit error:", e);
        toast({ variant: "destructive", title: "Error", description: e.message || "An error occurred." });
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
        
        const collectionRef = collection(db, 'gallery');
        for (const item of items) {
            const sanitizedItem = sanitizeData(item);
            await addDoc(collectionRef, { 
                ...sanitizedItem, 
                uploadedBy: username,
                date: new Date().toISOString(),
                createdAt: serverTimestamp(), 
                updatedAt: serverTimestamp() 
            });
        }
        await createAdminLog(db, {
            username,
            action: 'json-batch-import',
            collection: 'gallery',
            details: `Added ${items.length} gallery items via JSON.`
        });
        toast({ title: "Success", description: `${items.length} gallery items added successfully.` });
    } catch (e: any) {
        console.error("JSON submit error:", e);
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
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'System Logs'}}><Link href="/admin/logs"><ShieldQuestion /><span>System Logs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Settings'}}><Link href="/admin/settings/deploy"><Settings /><span>Settings</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader title="Gallery Management" />
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
