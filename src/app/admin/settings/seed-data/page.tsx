
'use client';
import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Loader2, HeartHandshake, ShieldQuestion, CloudUpload, Settings, Database, FileUp, FileCheck2, AlertCircle, Users } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import Link from "next/link";
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFunctions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminAuth } from '../../auth-provider';

export default function SeedDataPage() {
  const { isAdmin, logout } = useAdminAuth();
  const functions = useFunctions();
  const { toast } = useToast();

  const [isSeeding, setIsSeeding] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDryRun, setIsDryRun] = useState(true);
  const [seedReport, setSeedReport] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSeed = async () => {
    if (!functions || !file) {
      toast({ variant: 'destructive', title: 'Error', description: 'Function service or file not available.' });
      return;
    }
    if (!isAdmin) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in as an admin to perform this action.' });
        return;
    }

    setIsSeeding(true);
    setSeedReport(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileContent = e.target?.result as string;
        const docsByCollection = JSON.parse(fileContent);

        const importSeedDocuments = httpsCallable(functions, 'importSeedDocuments');
        const result: any = await importSeedDocuments({ docsByCollection, isDryRun });

        if (result.data?.report) {
            setSeedReport(result.data.report);
            toast({
                title: isDryRun ? "Dry Run Complete" : "Seeding Complete",
                description: `Check the report for details.`,
            });
        } else {
             throw new Error("Invalid response from function.");
        }
      } catch (error: any) {
        console.error("Seeding error:", error);
        toast({ variant: 'destructive', title: 'Seeding Failed', description: error.message });
      } finally {
        setIsSeeding(false);
      }
    };
    reader.readAsText(file);
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
           <Tabs defaultValue="seed" className="w-full">
               <TabsList>
                 <TabsTrigger value="users" asChild>
                    <Link href="/admin/settings/users">
                        <Users className="mr-2 h-4 w-4"/> User Management
                    </Link>
                </TabsTrigger>
                 <TabsTrigger value="deploy" asChild>
                    <Link href="/admin/settings/deploy">
                        <CloudUpload className="mr-2 h-4 w-4"/> Deploy Rules
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="seed">
                    <Database className="mr-2 h-4 w-4"/> Seed Data
                </TabsTrigger>
              </TabsList>
              <TabsContent value="seed" className="pt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seed Firestore Database</CardTitle>
                            <CardDescription>
                                Upload a JSON file to populate your Firestore collections. This is useful for initial setup or bulk data imports.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="json-file">JSON Seed File</Label>
                                <Input id="json-file" type="file" accept=".json" onChange={handleFileChange} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="dry-run-mode" checked={isDryRun} onCheckedChange={setIsDryRun} />
                                <Label htmlFor="dry-run-mode">Dry Run Mode</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {isDryRun 
                                    ? "Dry run mode will validate the data and simulate the import without writing to the database."
                                    : "This will perform a live write to your Firestore database. This action cannot be undone."
                                }
                            </p>
                            
                            {isDryRun ? (
                                <Button onClick={handleSeed} disabled={isSeeding || !file || !isAdmin} className="w-full">
                                    {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck2 className="mr-2 h-4 w-4" />}
                                    Perform Dry Run
                                </Button>
                            ) : (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isSeeding || !file || !isAdmin} className="w-full">
                                            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                                            Seed Database
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2"><AlertCircle />Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                You are about to perform a live write to the database. This will create or overwrite documents.
                                                This action is irreversible. Are you sure you want to continue?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleSeed}>Confirm & Seed Database</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                             {!isAdmin && (
                                <p className="text-sm text-yellow-500 flex items-center gap-2 mt-4"><AlertCircle className="h-4 w-4" />You do not have admin permissions to seed data.</p>
                            )}
                        </CardContent>
                    </Card>

                    {seedReport && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Seeding Report</CardTitle>
                                <CardDescription>ID: {seedReport.seedId}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p><strong>Status:</strong> {seedReport.failedCount > 0 ? 'Completed with errors' : 'Success'}</p>
                                    <p><strong>Successful Writes:</strong> {seedReport.successCount}</p>
                                    <p><strong>Failed Writes:</strong> {seedReport.failedCount}</p>
                                    <div>
                                        <strong>Collections Processed:</strong>
                                        <ul className="list-disc pl-5">
                                            {Object.entries(seedReport.countsPerCollection).map(([collection, count]) => (
                                                <li key={collection}>{collection as string}: {count as number} documents</li>
                                            ))}
                                        </ul>
                                    </div>
                                    {seedReport.errors.length > 0 && (
                                        <div>
                                            <strong>Errors:</strong>
                                            <ScrollArea className="h-48 mt-2 rounded-md border p-4 text-sm font-mono">
                                                <pre>
                                                    {JSON.stringify(seedReport.errors, null, 2)}
                                                </pre>
                                            </ScrollArea>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
              </TabsContent>
            </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
