
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirestore, useUser } from '@/firebase';
import { clearDatabase } from '@/lib/seed';
import { Loader2, Trash2, Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function DatabaseAdminPage() {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClear = async () => {
    if (!db) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firestore is not initialized.",
        });
        return;
    }
    setIsClearing(true);
    try {
      const result = await clearDatabase(db);
      if (result.success) {
        toast({
            title: "Success!",
            description: "Your database has been cleared.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Clearing Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
      setIsClearing(false);
    }
  };

  const handleSignOut = () => {
    getAuth().signOut();
    router.push('/');
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
                <SidebarMenuButton asChild tooltip={{children: 'Clubs'}}>
                    <Link href="/admin/clubs"><BookOpen /><span>Clubs</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Events'}}>
                    <Link href="/admin/events"><Calendar /><span>Events</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Gallery'}}>
                    <Link href="/admin/gallery"><GalleryHorizontal /><span>Gallery</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Blog'}}>
                    <Link href="/admin/blog"><Newspaper /><span>Blog</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Database'}} isActive>
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
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Database Management</h1>
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
          <Card className="max-w-xl border-destructive">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Clear Database</CardTitle>
                  <CardDescription>
                      This is a destructive action. Clicking the button below will permanently delete all documents from the `clubs`, `events`, `blog`, and `gallery` collections in your Firestore database. This cannot be undone.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" className="w-full" size="lg" disabled={isClearing || !db}>
                            {isClearing ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Clearing...</>
                            ) : (
                                <><Trash2 className="mr-2 h-4 w-4" /> Clear All Content</>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all content from your database. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClear} disabled={isClearing}>
                            {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Yes, delete everything
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
