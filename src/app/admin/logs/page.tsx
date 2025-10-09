
'use client';
import { useCollection, useFirestore } from '@/firebase';
import type { AdminLog } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Loader2, HeartHandshake, ShieldQuestion } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth } from '../auth-provider';
import { AdminHeader } from '@/components/admin/admin-header';
import { orderBy } from 'firebase/firestore';

export default function LogsAdminPage() {
  const { logout } = useAdminAuth();
  
  const { data: logs, loading } = useCollection<AdminLog>('admin_logs', orderBy('timestamp', 'desc'));

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
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}}><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'System Logs'}} isActive><Link href="/admin/logs"><ShieldQuestion /><span>System Logs</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader title="System Logs" />
        <main className="flex-1 p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Admin Activity</CardTitle>
                    <CardDescription>A read-only log of all changes made in the admin panel.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>) : (
                    <div className="max-h-[70vh] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted/40 backdrop-blur-sm">
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Collection</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {log.timestamp ? format(new Date(log.timestamp.seconds * 1000), 'yyyy-MM-dd hh:mm a') : 'N/A'}
                                    </TableCell>
                                    <TableCell>{log.username}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.collection}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    )}
                     { !loading && logs.length === 0 && (
                        <p className="text-center text-muted-foreground py-10">No log entries found.</p>
                    )}
                </CardContent>
            </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
