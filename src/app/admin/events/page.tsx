
'use client';
import { useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { Event } from '@/lib/types';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, MoreHorizontal, Pencil, Trash2, Loader2, HeartHandshake, ShieldQuestion, Settings } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EventForm } from '@/components/admin/event-form';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
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

export default function EventsAdminPage() {
  const { username, logout } = useAdminAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const { data: events, loading } = useCollection<Event>('events');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (event: Event) => {
    setEventToDelete(event);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete || !db || !username) return;
    
    setIsSubmitting(true);
    const docRef = doc(db, 'events', eventToDelete.id);
    
    try {
        await deleteDoc(docRef);
        await createAdminLog(db, {
            username,
            action: 'delete',
            collection: 'events',
            docId: eventToDelete.id,
            details: `Deleted event: ${eventToDelete.title}`
        });
        toast({ title: "Success", description: "Event deleted successfully." });
    } catch(e: any) {
        console.error("Delete error:", e);
        toast({ variant: "destructive", title: "Error", description: e.message || "Failed to delete event." });
    } finally {
        setIsAlertOpen(false);
        setEventToDelete(null);
        setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (values: any) => {
      if (!db || !username) return;
      setIsSubmitting(true);
      
      const sanitizedValues = sanitizeData(values);
      const data = { ...sanitizedValues, updatedAt: serverTimestamp() };

      try {
        if (selectedEvent) {
            const docRef = doc(db, 'events', selectedEvent.id);
            await updateDoc(docRef, data);
            await createAdminLog(db, {
                username,
                action: 'update',
                collection: 'events',
                docId: selectedEvent.id,
                details: `Updated event: ${values.title}`
            });
            toast({ title: "Success", description: "Event updated successfully." });
            setIsDialogOpen(false);
        } else {
            const collectionRef = collection(db, 'events');
            const newDoc = await addDoc(collectionRef, { ...data, createdAt: serverTimestamp() });
            await createAdminLog(db, {
                username,
                action: 'create',
                collection: 'events',
                docId: newDoc.id,
                details: `Created event: ${values.title}`
            });
            toast({ title: "Success", description: "Event added successfully." });
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
        
        const collectionRef = collection(db, 'events');
        for (const item of items) {
            const sanitizedItem = sanitizeData(item);
            await addDoc(collectionRef, { ...sanitizedItem, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
        
        await createAdminLog(db, {
            username,
            action: 'json-batch-import',
            collection: 'events',
            details: `Added ${items.length} events via JSON.`
        });
        toast({ title: "Success", description: `${items.length} events added successfully.` });
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
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Events'}} isActive><Link href="/admin/events"><Calendar /><span>Events</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Gallery'}}><Link href="/admin/gallery"><GalleryHorizontal /><span>Gallery</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}}><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'System Logs'}}><Link href="/admin/logs"><ShieldQuestion /><span>System Logs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Settings'}}><Link href="/admin/settings/deploy"><Settings /><span>Settings</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader title="Events Management" />
        <main className="flex-1 p-6 space-y-6">
            <Card>
                <CardHeader><CardTitle>Add Events</CardTitle><CardDescription>Add a single event via the form or multiple events via JSON.</CardDescription></CardHeader>
                <CardContent>
                    <Tabs defaultValue="manual">
                        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="manual">Manual Entry</TabsTrigger><TabsTrigger value="json">JSON Input</TabsTrigger></TabsList>
                        <TabsContent value="manual" className="pt-4"><EventForm event={null} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} /></TabsContent>
                        <TabsContent value="json" className="pt-4"><JsonEntryForm entityName="Event" onSubmit={handleJsonSubmit} isSubmitting={isSubmitting} /></TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Manage Events</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>) : (
                    <Table>
                        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead>Location</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {events.map((event) => (<TableRow key={event.id}><TableCell className="font-medium">{event.title}</TableCell><TableCell>{event.date && !isNaN(new Date(event.date).getTime()) ? format(new Date(event.date), 'PPP') : 'N/A'}</TableCell><TableCell>{event.venue}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={() => handleEdit(event)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(event)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </main>
      </SidebarInset>

      <EventForm isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleFormSubmit} event={selectedEvent} isSubmitting={isSubmitting} isDialog={true} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the event and remove its data from our servers.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
