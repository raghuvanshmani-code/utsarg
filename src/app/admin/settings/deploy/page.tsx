
'use client';
import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Loader2, HeartHandshake, ShieldQuestion, Settings, UploadCloud } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { useAdminAuth } from '../../auth-provider';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFunctions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DeployPage() {
  const { logout } = useAdminAuth();
  const functions = useFunctions();
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeployRules = async () => {
    if (!functions) {
      toast({ variant: 'destructive', title: 'Error', description: 'Functions service not available.' });
      return;
    }
    setIsDeploying(true);
    const deployRulesCallable = httpsCallable(functions, 'deployRules');
    try {
      await deployRulesCallable();
      toast({ title: 'Success', description: 'Firestore rules have been deployed successfully.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Deployment Failed', description: error.message });
      console.error(error);
    } finally {
      setIsDeploying(false);
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
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}}><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'System Logs'}}><Link href="/admin/logs"><ShieldQuestion /><span>System Logs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Settings'}} isActive><Link href="/admin/settings/users"><Settings /><span>Settings</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter><Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader title="Settings" />
        <main className="flex-1 p-6 space-y-6">
            <Tabs defaultValue="deploy">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users" asChild><Link href="/admin/settings/users">User Management</Link></TabsTrigger>
                <TabsTrigger value="deploy" asChild><Link href="/admin/settings/deploy">Deploy</Link></TabsTrigger>
              </TabsList>
            </Tabs>
           <Card>
              <CardHeader>
                  <CardTitle>Deploy Firestore Rules</CardTitle>
                  <CardDescription>
                      This will deploy the `firestore.rules` file from your project to your live Firebase project. This is necessary to apply any changes to your security rules.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleDeployRules} disabled={isDeploying}>
                  {isDeploying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Deploy Firestore Rules
                </Button>
              </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
