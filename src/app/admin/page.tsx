
'use client';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Database } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";

export default function AdminDashboard() {
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
                      <SidebarMenuButton asChild tooltip={{children: 'Dashboard'}} isActive>
                          <Link href="/admin"><Home /><span>Dashboard</span></Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={{children: 'Clubs'}}>
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
                <div className="flex-1">
                    <h1 className="text-lg font-semibold">Admin Dashboard</h1>
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
                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-muted rounded-lg">
                    <h2 className="text-2xl font-bold">Welcome!</h2>
                    <p className="text-muted-foreground">Select a category from the sidebar to manage your content.</p>
                </div>
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
