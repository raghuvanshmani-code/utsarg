
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, UploadCloud, Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Database, Upload, FileJson, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Papa from 'papaparse';

type SeedMode = "clubs" | "events" | "volunteers" | "posts" | "gallery" | "finances";

export default function SeedAdminPage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<SeedMode>("clubs");
  const [docs, setDocs] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  
  const handleSignOut = () => {
    getAuth().signOut();
    router.push('/');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        if (file.type === 'application/json') {
          const parsedDocs = JSON.parse(content);
          setDocs(Array.isArray(parsedDocs) ? parsedDocs : [parsedDocs]);
        } else if (file.type === 'text/csv') {
            Papa.parse(content, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setDocs(results.data);
                }
            });
        } else {
            toast({ variant: 'destructive', title: 'Unsupported file type', description: 'Please upload a JSON or CSV file.' });
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Parsing Error', description: 'Could not parse the file. Please ensure it is valid.' });
        setDocs([]);
      }
    };
    reader.readAsText(file);
  };

  const handleSeed = async () => {
    if (docs.length === 0) {
      toast({ variant: 'destructive', title: 'No Data', description: 'Please upload a file with documents to seed.' });
      return;
    }
    
    if (isDryRun) {
        toast({ title: 'Dry Run Completed', description: 'No data was written. Uncheck "Dry Run" to seed the database.' });
        return;
    }

    setIsProcessing(true);
    const functions = getFunctions();
    const importSeedDocuments = httpsCallable(functions, 'importSeedDocuments');

    try {
      const result: any = await importSeedDocuments({ mode, docs });
      if (result.data.success) {
        toast({
          title: 'Seeding Successful',
          description: `${result.data.successCount} documents were written to the '${mode}' collection.`,
        });
      } else {
        throw new Error(result.data.errors?.[0]?.error || 'An unknown error occurred during seeding.');
      }
    } catch (error: any) {
      console.error("Error calling Cloud Function:", error);
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const previewHeaders = docs.length > 0 ? Object.keys(docs[0]) : [];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader><Logo /></SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Dashboard'}}><Link href="/admin"><Home /><span>Dashboard</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Clubs'}}><Link href="/admin/clubs"><BookOpen /><span>Clubs</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Events'}}><Link href="/admin/events"><Calendar /><span>Events</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Gallery'}}><Link href="/admin/gallery"><GalleryHorizontal /><span>Gallery</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Blog'}}><Link href="/admin/blog"><Newspaper /><span>Blog</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Database'}}><Link href="/admin/database"><Database /><span>Database</span></Link></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton asChild tooltip={{children: 'Seed Data'}} isActive><Link href="/admin/seed"><Upload /><span>Seed Data</span></Link></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start p-2 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center">
            <LogOut className="h-5 w-5" /><span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Admin Data Seeder</h1>
          </div>
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-8 w-8"><AvatarImage src={user.photoURL ?? ''} /><AvatarFallback>{user.displayName?.charAt(0) ?? 'A'}</AvatarFallback></Avatar>
              <span>{user.displayName}</span>
            </div>
          )}
        </header>
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Data into Firestore</CardTitle>
              <CardDescription>Upload a JSON or CSV file to seed a collection. Ensure the file structure matches the target collection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mode-select">Target Collection</Label>
                  <Select value={mode} onValueChange={(value) => setMode(value as SeedMode)}>
                    <SelectTrigger id="mode-select"><SelectValue placeholder="Select a collection" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clubs">Clubs</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="volunteers">Volunteers</SelectItem>
                      <SelectItem value="posts">Posts</SelectItem>
                      <SelectItem value="gallery">Gallery</SelectItem>
                      <SelectItem value="finances">Finances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <Input id="file-upload" type="file" accept=".json,.csv" onChange={handleFileChange} />
                </div>
              </div>
              
              {docs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Data Preview</CardTitle>
                        <CardDescription>Found {docs.length} documents in {fileName}.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-64 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>{previewHeaders.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                            </TableHeader>
                            <TableBody>
                                {docs.slice(0, 5).map((doc, i) => (
                                    <TableRow key={i}>
                                        {previewHeaders.map(header => (
                                            <TableCell key={header} className="max-w-xs truncate">
                                                {typeof doc[header] === 'object' ? JSON.stringify(doc[header]) : String(doc[header])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border bg-background p-4">
                 <div className="flex items-center space-x-2">
                    <Switch id="dry-run-switch" checked={isDryRun} onCheckedChange={setIsDryRun} />
                    <Label htmlFor="dry-run-switch" className="flex flex-col">
                        <span>Dry Run Mode</span>
                        <span className="text-xs text-muted-foreground">No data will be written to the database.</span>
                    </Label>
                </div>
                <Button onClick={handleSeed} disabled={isProcessing || docs.length === 0} size="lg">
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    {isDryRun ? 'Perform Dry Run' : 'Seed Database'}
                </Button>
              </div>

               {!isDryRun && (
                 <div className="flex items-start gap-3 rounded-lg border border-destructive/50 p-4 text-destructive">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-semibold">Warning: Live Run</p>
                        <p className="text-sm">You are about to perform a live write to the database. This action may be irreversible.</p>
                    </div>
                </div>
               )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
