'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirestore, useUser } from '@/firebase';
import { seedDatabase } from '@/lib/seed';
import { Loader2, PartyPopper, Home, Users, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function DatabaseAdminPage() {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    if (!db) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firestore is not initialized.",
        });
        return;
    }
    setIsSeeding(true);
    try {
      const result = await seedDatabase(db);
      if (result.success) {
        toast({
            title: "Success!",
            description: "Your database has been populated with sample data.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Seeding Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
      setIsSeeding(false);
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
              <SidebarMenuButton asChild tooltip={{children: 'Users'}}>
                <Link href="/admin/users"><Users /><span>Users</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{children: 'Clubs'}}>
                    <BookOpen />
                    <span>Clubs</span>
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
                <SidebarMenuButton asChild tooltip={{children: 'Database'}} isActive>
                    <Link href="/admin/database"><Database /><span>Database</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarContent className="!flex-row items-center justify-center p-2 group-data-[collapsible=icon]:gap-2">
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2">
                <LogOut className="h-5 w-5" /> 
                <span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
            </Button>
        </SidebarContent>
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
          <Card className="max-w-xl">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PartyPopper className="text-primary"/> Populate Database</CardTitle>
                  <CardDescription>
                      Click the button below to add sample clubs, events, blog posts, and gallery images to your Firestore database. 
                      This will allow you to see the website with content. This action can be performed multiple times, but it will overwrite existing data with the same IDs.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={handleSeed} disabled={isSeeding || !db} className="w-full" size="lg">
                      {isSeeding ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding...</>
                      ) : (
                          'Seed Sample Data'
                      )}
                  </Button>
              </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
