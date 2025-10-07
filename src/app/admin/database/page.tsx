
'use client';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Database, AlertTriangle, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function DatabaseAdminPage() {
  const { user } = useUser();
  const router = useRouter();

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
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Seed Data'}}>
                    <Link href="/admin/seed"><Upload /><span>Seed Data</span></Link>
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
                  <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Database Operations</CardTitle>
                  <CardDescription>
                      Database clearing operations are disabled from the UI for security reasons. To clear collections, please use the Firebase Console.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground">
                    You can manage your Firestore data, including deleting collections and documents, directly in the <a href={`https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/data`} target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase Console</a>.
                 </p>
              </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
