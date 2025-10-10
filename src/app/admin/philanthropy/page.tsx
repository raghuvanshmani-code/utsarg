'use client';
import { useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { PhilanthropyActivity } from '@/lib/types';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, MoreHorizontal, Pencil, Trash2, Loader2, HeartHandshake, ShieldQuestion, Settings } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PhilanthropyForm } from '@/components/admin/philanthropy-form';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonEntryForm } from '@/components/admin/json-entry-form';
import { createAdminLog } from '@/lib/admin-logs';
import { AdminHeader } from '@/components/admin/admin-header';
import { getAuth } from 'firebase/auth';

const sanitizeData = (data: any) => {
  const sanitized: { [key: string]: any } = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
};

export default function PhilanthropyAdminPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const { data: activities, loading } = useCollection<PhilanthropyActivity>('philanthropy');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<PhilanthropyActivity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<PhilanthropyActivity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => getAuth().signOut();

  const handleEdit = (activity: PhilanthropyActivity) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (activity: PhilanthropyActivity) => {
    setActivityToDelete(activity);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!activityToDelete || !db || !user) return;
    
    setIsSubmitting(true);
    const docRef = doc(db, 'philanthropy', activityToDelete.id);
    
    try {
        await deleteDoc(docRef);
        await createAdminLog(db, {
            username: user.displayName || user.email || 'Unknown Admin',
            action: 'delete',
            collection: 'philanthropy',
            docId: activityToDelete.id,
            details: `Deleted activity: ${activityToDelete.type}`
        });
        toast({ title: "Success", description: "Activity deleted successfully." });
    } catch(e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message || "Failed to delete activity." });
        console.error("Delete error:", e);
    } finally {
        setIsAlertOpen(false);
        setActivityToDelete(null);
        setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (values: any) => {
      if (!db || !user) return;
      setIsSubmitting(true);
      
      const data = sanitizeData({ ...values, updatedAt: serverTimestamp() });

      try {
        if (selectedActivity) {
            const docRef = doc(db, 'philanthropy', selectedActivity.id);
            await updateDoc(docRef, data);
            await createAdminLog(db, {
                username: user.displayName || user.email || 'Unknown Admin',
                action: 'update',
                collection: 'philanthropy',
                docId: selectedActivity.id,
                details: `Updated activity: ${values.type}`
            });
            toast({ title: "Success", description: "Activity updated successfully." });
        } else {
            const collectionRef = collection(db, 'philanthropy');
            const newDoc = await addDoc(collectionRef, { ...data, createdAt: serverTimestamp() });
            await createAdminLog(db, {
                username: user.displayName || user.email || 'Unknown Admin',
                action: 'create',
                collection: 'philanthropy',
                docId: newDoc.id,
                details: `Created activity: ${values.type}`
            });
            toast({ title: "Success", description: "Activity added successfully." });
        }
        setIsDialogOpen(false);
        setSelectedActivity(null);
      } catch(e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message || "An error occurred." });
        console.error("Form submit error:", e);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleJsonSubmit = async (jsonContent: string) => {
    if (!db || !user) return;
    setIsSubmitting(true);
    try {
        const items: Partial<PhilanthropyActivity & { id: string }>[] = JSON.parse(jsonContent);
        if (!Array.isArray(items)) throw new Error("JSON content must be an array of objects.");
        
        const collectionRef = collection(db, 'philanthropy');
        for (const item of items) {
            const sanitizedItem = sanitizeData(item);
            await addDoc(collectionRef, { ...sanitizedItem, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
        await createAdminLog(db, {
            username: user.displayName || user.email || 'Unknown Admin',
            action: 'json-batch-import',
            collection: 'philanthropy',
            details: `Added ${items.length} activities via JSON.`
        });
        toast({ title: "Success", description: `${items.length} activities added successfully.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "JSON Error", description: e.message });
        console.error("JSON submit error:", e);
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
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Philanthropy'}} isActive><Link href="/admin/philanthropy"><HeartHandshake /><span>Philanthropy</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Events'}}><Link href="/admin/events"><Calendar /><span>Events</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Gallery'}}><Link href="/admin/gallery"><GalleryHorizontal /><span>Gallery</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}}><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'System Logs'}}><Link href="/admin/logs"><ShieldQuestion /><span>System Logs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Settings'}}><Link href="/admin/settings/users"><Settings /><span>Settings</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={handleLogout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader title="Philanthropy Management" />
        <main className="flex-1 p-6 space-y-6">
            <Card>
                <CardHeader><CardTitle>Add Activities</CardTitle><CardDescription>Add a single activity via the form or multiple activities via JSON.</CardDescription></CardHeader>
                <CardContent>
                    <Tabs defaultValue="manual">
                        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="manual">Manual Entry</TabsTrigger><TabsTrigger value="json">JSON Input</TabsTrigger></TabsList>
                        <TabsContent value="manual" className="pt-4"><PhilanthropyForm activity={null} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} /></TabsContent>
                        <TabsContent value="json" className="pt-4"><JsonEntryForm entityName="Activity" onSubmit={handleJsonSubmit} isSubmitting={isSubmitting} /></TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle>Manage Activities</CardTitle>
                  <div className="flex items-center justify-between">
                    <CardDescription>Edit or delete existing philanthropic activities.</CardDescription>
                    <Button onClick={() => { setSelectedActivity(null); setIsDialogOpen(true); }}>Add New Activity</Button>
                  </div>
                </CardHeader>
                <CardContent>
                    {loading ? (<div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>) : (
                    <Table>
                        <TableHeader><TableRow><TableHead>Type</TableHead><TableHead className="hidden md:table-cell max-w-sm">Description</TableHead><TableHead className="hidden lg:table-cell">Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {activities.map((activity) => (<TableRow key={activity.id}><TableCell className="font-medium">{activity.type}</TableCell><TableCell className="hidden md:table-cell max-w-sm truncate">{activity.description}</TableCell><TableCell className="hidden lg:table-cell">{activity.date && !isNaN(new Date(activity.date).getTime()) ? format(new Date(activity.date), 'PPP') : 'N/A'}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={() => handleEdit(activity)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(activity)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </main>
      </SidebarInset>

      <PhilanthropyForm isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleFormSubmit} activity={selectedActivity} isSubmitting={isSubmitting} isDialog={true} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this activity.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
