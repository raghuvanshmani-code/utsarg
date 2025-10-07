
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, UploadCloud, Home, BookOpen, Calendar, GalleryHorizontal, Newspaper, LogOut, Database, Upload, AlertTriangle, FileJson, CheckCircle, XCircle } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';

type SeedData = { [collectionName: string]: { [docId: string]: any } };
type SeedReport = { 
    status: string;
    successCount: number;
    failedCount: number;
    errors: { collection: string; id: string; error: string }[];
    logId: string;
};

export default function SeedAdminPage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [seedData, setSeedData] = useState<SeedData | null>(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [seedReport, setSeedReport] = useState<SeedReport | null>(null);
  
  const handleSignOut = () => {
    getAuth().signOut();
    router.push('/');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSeedReport(null); // Reset report on new file
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        if (file.type === 'application/json') {
          const parsedData = JSON.parse(content);
           if (typeof parsedData === 'object' && !Array.isArray(parsedData) && parsedData !== null) {
            setSeedData(parsedData);
            toast({ title: 'File Loaded', description: `${file.name} is ready for a dry run.` });
          } else {
            throw new Error('JSON root must be an object of collections.');
          }
        } else {
            throw new Error('Unsupported file type. Please upload a single JSON file.');
        }
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'File Parsing Error', description: error.message || 'Could not parse the file.' });
        setSeedData(null);
        setFileName('');
      }
    };
    reader.readAsText(file);
  };

  const handleSeed = async () => {
    if (!seedData || Object.keys(seedData).length === 0) {
      toast({ variant: 'destructive', title: 'No Data', description: 'Please upload a valid data file.' });
      return;
    }
    
    if (isDryRun) {
        toast({ title: 'Dry Run Completed', description: `Simulated seeding from ${fileName}. No data was written.` });
        // Although it's a dry run, we can still generate a preview report for clarity.
        setSeedReport({
            status: "Dry Run Preview",
            successCount: 0,
            failedCount: 0,
            errors: [],
            logId: "N/A"
        });
        return;
    }

    setIsProcessing(true);
    setSeedReport(null);
    const functions = getFunctions();
    const importSeedDocuments = httpsCallable(functions, 'importSeedDocuments');

    try {
      const result = await importSeedDocuments({ seedData }) as { data: SeedReport };
      const report = result.data;
      setSeedReport(report);

      if (report.status === 'Success') {
        toast({
          title: 'Seeding Successful',
          description: `Wrote ${report.successCount} documents. See report below.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: 'Seeding Completed with Errors',
          description: `Wrote ${report.successCount} docs, but ${report.failedCount} failed. Check report.`,
        });
      }
    } catch (error: any) {
      console.error("Cloud Function Error:", error);
      toast({
        variant: "destructive",
        title: `Seeding Failed: ${error.code || 'UNKNOWN_ERROR'}`,
        description: error.message || "The function returned an error. Check Cloud Function logs for details.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const previewCollections = seedData ? Object.keys(seedData) : [];

  const jsonFormatExample = `{
  "collection_name": {
    "your_custom_document_id_1": {
      "field1": "value1",
      "field2": 123,
      "dateField": "2024-01-01T12:00:00.000Z"
    },
    "your_custom_document_id_2": {
      "field1": "value2",
      "field2": 456
    }
  },
  "another_collection": {
    "another_doc_id": {
      "some_field": true
    }
  }
}`;

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
            <h1 className="text-lg font-semibold">Database Seeder</h1>
          </div>
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-8 w-8"><AvatarImage src={user.photoURL ?? ''} /><AvatarFallback>{user.displayName?.charAt(0) ?? 'A'}</AvatarFallback></Avatar>
              <span>{user.displayName}</span>
            </div>
          )}
        </header>
        <main className="flex-1 p-6 grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileJson /> Import from JSON</CardTitle>
                <CardDescription>Upload a single JSON file where each key is a collection name and the value is an object of documents to be seeded.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload Seed File</Label>
                    <Input id="file-upload" type="file" accept=".json" onChange={handleFileChange} className="max-w-md" />
                  </div>
                
                {seedData && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Dry Run Preview</CardTitle>
                          <CardDescription>Found {previewCollections.length} collections in <strong>{fileName}</strong>. This is a preview of the data structure. No data will be written in Dry Run mode.</CardDescription>
                      </CardHeader>
                      <CardContent className="max-h-72 overflow-auto">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                    <TableHead>Collection</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead>Sample ID</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {previewCollections.map((collectionName) => {
                                    const docIds = Object.keys(seedData[collectionName]);
                                    return (
                                      <TableRow key={collectionName}>
                                          <TableCell className="font-medium">{collectionName}</TableCell>
                                          <TableCell>{docIds.length}</TableCell>
                                          <TableCell className="font-mono text-xs">{docIds[0] || 'N/A'}</TableCell>
                                      </TableRow>
                                    )
                                  })}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border bg-background p-4">
                  <div className="flex items-center space-x-2">
                      <Switch id="dry-run-switch" checked={isDryRun} onCheckedChange={setIsDryRun} aria-label="Toggle dry run mode" />
                      <Label htmlFor="dry-run-switch" className="flex flex-col">
                          <span>Dry Run Mode</span>
                          <span className="text-xs text-muted-foreground">Simulate seeding without writing to the database.</span>
                      </Label>
                  </div>
                  <Button onClick={handleSeed} disabled={isProcessing || !seedData} size="lg">
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                      {isDryRun ? 'Perform Dry Run' : 'Confirm & Seed Database'}
                  </Button>
                </div>

                {!isDryRun && (
                  <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                          <p className="font-semibold">LIVE RUN ENABLED</p>
                          <p className="text-sm">You are about to write data to the live database. This action may be irreversible. Always perform a Dry Run first.</p>
                      </div>
                  </div>
                )}

                {seedReport && (
                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              {seedReport.status === 'Success' ? <CheckCircle className="text-green-500" /> : seedReport.status === "Dry Run Preview" ? <FileJson /> : <XCircle className="text-red-500" />}
                              Seed Report
                          </CardTitle>
                          <CardDescription>
                              Operation status: {seedReport.status}. {seedReport.successCount} documents written. 
                              Log ID: <span className="font-mono text-xs">{seedReport.logId}</span>
                          </CardDescription>
                      </CardHeader>
                      {seedReport.errors.length > 0 && (
                          <CardContent className="max-h-72 overflow-auto">
                              <h4 className="font-semibold mb-2">Errors:</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                      <TableHead>Collection</TableHead>
                                      <TableHead>Doc ID</TableHead>
                                      <TableHead>Error</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {seedReport.errors.map((err, i) => (
                                      <TableRow key={i} className="text-destructive">
                                          <TableCell>{err.collection}</TableCell>
                                          <TableCell className="font-mono text-xs">{err.id}</TableCell>
                                          <TableCell>{err.error}</TableCell>
                                      </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                          </CardContent>
                      )}
                  </Card>
                )}
            </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 lg:md:col-span-1">
              <Card>
                  <CardHeader>
                      <CardTitle>Required JSON Format</CardTitle>
                      <CardDescription>Your seed file must follow this structure. The top-level keys are your collection names, and the nested keys are your custom document IDs.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                          <code>{jsonFormatExample}</code>
                      </pre>
                  </CardContent>
              </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
