
'use client';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, HeartHandshake, ShieldQuestion } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { useAdminAuth } from "./auth-provider";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminDashboard() {
  const { logout } = useAdminAuth();

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
                      <SidebarMenuButton asChild tooltip={{children: 'Philanthropy'}}>
                         <Link href="/admin/philanthropy"><HeartHandshake /><span>Philanthropy</span></Link>
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
                      <SidebarMenuButton asChild tooltip={{children: 'System Logs'}}>
                          <Link href="/admin/logs"><ShieldQuestion /><span>System Logs</span></Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2">
                    <LogOut className="h-5 w-5" /> 
                    <span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
                </Button>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <AdminHeader title="Admin Dashboard" />
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
