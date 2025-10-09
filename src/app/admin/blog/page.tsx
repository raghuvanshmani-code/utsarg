
'use client';
import { useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Post } from '@/lib/types';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, MoreHorizontal, Pencil, Trash2, Loader2, HeartHandshake } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogForm } from '@/components/admin/blog-form';
import { JsonEntryForm } from '@/components/admin/json-entry-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function BlogAdminPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: posts, loading } = useCollection<Post>('blog');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = () => {
    getAuth().signOut();
    router.push('/');
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (post: Post) => {
    setPostToDelete(post);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (!postToDelete || !db) return;
    
    setIsSubmitting(true);
    const docRef = doc(db, 'blog', postToDelete.id);
    
    deleteDoc(docRef).then(() => {
        toast({ title: "Success", description: "Post deleted successfully." });
        setIsAlertOpen(false);
        setPostToDelete(null);
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsSubmitting(false);
    });
  };

  const handleFormSubmit = (values: any) => {
      if (!db) return;
      setIsSubmitting(true);
      
      const sanitizedValues = sanitizeData(values);
      const data = { ...sanitizedValues, updatedAt: serverTimestamp() };

      if (selectedPost) {
          const docRef = doc(db, 'blog', selectedPost.id);
          updateDoc(docRef, data).then(() => {
              toast({ title: "Success", description: "Post updated successfully." });
              setIsDialogOpen(false);
          }).catch(serverError => {
              const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
              errorEmitter.emit('permission-error', permissionError);
          }).finally(() => {
              setIsSubmitting(false);
          });
      } else {
          const collectionRef = collection(db, 'blog');
          addDoc(collectionRef, { ...data, createdAt: serverTimestamp() }).then(() => {
              toast({ title: "Success", description: "Post added successfully." });
          }).catch(serverError => {
              const permissionError = new FirestorePermissionError({ path: collectionRef.path, operation: 'create', requestResourceData: data });
              errorEmitter.emit('permission-error', permissionError);
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
        
        const collectionRef = collection(db, 'blog');
        for (const item of items) {
            const sanitizedItem = sanitizeData(item);
            await addDoc(collectionRef, { ...sanitizedItem, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
        toast({ title: "Success", description: `${items.length} posts added successfully.` });
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
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Gallery'}}><Link href="/admin/gallery"><GalleryHorizontal /><span>Gallery</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}} isActive><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={handleSignOut} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1 flex justify-between items-center"><h1 className="text-lg font-semibold">Blog Management</h1></div>
          {user && (<div className="flex items-center gap-2 text-sm"><Avatar className="h-8 w-8"><AvatarImage src={user.photoURL ?? ''} /><AvatarFallback>{user.displayName?.charAt(0) ?? 'A'}</AvatarFallback></Avatar><span>{user.displayName}</span></div>)}
        </header>
        <main className="flex-1 p-6 space-y-6">
            <Card>
                <CardHeader><CardTitle>Add Posts</CardTitle><CardDescription>Add a single post via the form or multiple posts via JSON.</CardDescription></CardHeader>
                <CardContent>
                    <Tabs defaultValue="manual">
                        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="manual">Manual Entry</TabsTrigger><TabsTrigger value="json">JSON Input</TabsTrigger></TabsList>
                        <TabsContent value="manual" className="pt-4"><BlogForm post={null} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} /></TabsContent>
                        <TabsContent value="json" className="pt-4"><JsonEntryForm entityName="Post" onSubmit={handleJsonSubmit} isSubmitting={isSubmitting} /></TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Manage Posts</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>) : (
                    <Table>
                        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {posts.map((post) => (<TableRow key={post.id}><TableCell className="font-medium">{post.title}</TableCell><TableCell>{post.author}</TableCell><TableCell>{post.date && !isNaN(new Date(post.date).getTime()) ? format(new Date(post.date), 'PPP') : 'N/A'}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={() => handleEdit(post)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(post)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </main>
      </SidebarInset>

      <BlogForm isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleFormSubmit} post={selectedPost} isSubmitting={isSubmitting} isDialog={true} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this post and remove its data from our servers.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}

    