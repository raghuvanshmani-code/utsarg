'use client';
import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Loader2, HeartHandshake, ShieldQuestion, CloudUpload, Settings, AlertTriangle, Database, Users } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFunctions, useUser } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAuth } from 'firebase/auth';

export default function DeployRulesPage() {
  const { user } = useUser();
  const functions = useFunctions();
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);
  const handleLogout = () => getAuth().signOut();

  const handleDeploy = async () => {
    if (!functions || !user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to perform this action."
        });
        return;
    }
    
    setIsDeploying(true);
    
    try {
        const deployRules = httpsCallable(functions, 'deployRules');
        const result = await deployRules();
        
        if ((result.data as any)?.success) {
            toast({
                title: "Deployment Successful",
                description: "Your new Firestore security rules have been deployed.",
            });
        } else {
            throw new Error((result.data as any)?.error || "An unknown error occurred.");
        }

    } catch (error: any) {
        console.error("Deployment error:", error);
        toast({
            variant: "destructive",
            title: "Deployment Failed",
            description: error.message || "Could not deploy Firestore rules.",
        });
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
        <SidebarFooter><Button variant="ghost" onClick={handleLogout} className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center p-2"><LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span></Button></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AdminHeader title="Settings" />
        <main className="flex-1 p-6 space-y-6">
           <Tabs defaultValue="deploy" className="w-full">
              <TabsList>
                <TabsTrigger value="users" asChild>
                    <Link href="/admin/settings/users">
                        <Users className="mr-2 h-4 w-4"/> User Management
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="deploy">
                    <CloudUpload className="mr-2 h-4 w-4"/> Deploy Rules
                </TabsTrigger>
                <TabsTrigger value="seed" asChild>
                    <Link href="/admin/settings/seed-data">
                        <Database className="mr-2 h-4 w-4"/> Seed Data
                    </Link>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="deploy" className="pt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Deploy Firestore Rules</CardTitle>
                        <CardDescription>
                            Deploy your local `firestore.rules` file to your live Firebase project. 
                            This action will overwrite the existing security rules in production.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-start gap-4">
                            <p>
                               Click the button below to apply the `firestore.rules` from the project's root directory to your live database. You must be authenticated as an admin user.
                            </p>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isDeploying || !user?.customClaims?.admin}>
                                        {isDeploying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudUpload className="mr-2 h-4 w-4" />}
                                        Deploy Rules to Production
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle /> Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will overwrite your production Firestore security rules. This can be a high-risk operation. Please ensure you are deploying the correct rules file.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeploy}>
                                        Yes, deploy the rules
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                             {!user?.customClaims?.admin && (
                                <p className="text-sm text-yellow-500 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />You do not have admin permissions to deploy rules.</p>
                            )}

                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
