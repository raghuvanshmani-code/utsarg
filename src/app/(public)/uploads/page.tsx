'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useStorage, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

type UserImage = {
    id: string;
    downloadURL: string;
    fileName: string;
    fileSize: number;
    uploadedAt: { seconds: number; nanoseconds: number };
};

export default function UploadPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const storage = useStorage();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const { data: userImages, loading: imagesLoading } = useCollection<UserImage>(
        user ? `userImages` : '' // Simplified query, will be filtered client-side or via security rules
    );
    const filteredUserImages = userImages.filter(img => img.userId === user?.uid);


    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login?redirect=/uploads');
        }
    }, [user, userLoading, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file || !user || !storage || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Cannot upload file. User not logged in or services unavailable.',
            });
            return;
        }

        setUploading(true);
        setProgress(0);

        // Path: /userUploads/{uid}/{filename}
        const storageRef = ref(storage, `userUploads/${user.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(prog);
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'Upload Failed',
                    description: 'There was a problem uploading your file. Please check security rules and try again.',
                });
                setUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    // Save metadata to Firestore
                    try {
                        await addDoc(collection(firestore, 'userImages'), {
                            userId: user.uid,
                            downloadURL: downloadURL,
                            fileName: file.name,
                            fileSize: file.size,
                            uploadedAt: serverTimestamp(),
                        });

                        toast({
                            title: 'Upload Complete',
                            description: `${file.name} has been successfully uploaded.`,
                        });
                    } catch (firestoreError) {
                        console.error("Failed to save metadata:", firestoreError);
                        toast({
                            variant: 'destructive',
                            title: 'Database Error',
                            description: 'Image uploaded, but failed to save metadata to database.',
                        });
                    } finally {
                        setUploading(false);
                        setFile(null);
                    }
                });
            }
        );
    };

    if (userLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="My Uploads"
                subtitle="Upload and manage your image files here."
            />
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid gap-12 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload New Image</CardTitle>
                            <CardDescription>Select an image from your computer to upload to Firebase Storage.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input type="file" onChange={handleFileChange} accept="image/*" disabled={uploading} />
                            
                            {uploading && (
                                <div className="space-y-2">
                                     <Progress value={progress} />
                                     <p className="text-sm text-center text-muted-foreground">{Math.round(progress)}%</p>
                                </div>
                            )}

                            <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {uploading ? 'Uploading...' : 'Upload File'}
                            </Button>

                            <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    Files are uploaded to a private folder under your user ID. The necessary Storage and Firestore security rules have been set up to protect your files.
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Uploaded Files</CardTitle>
                            <CardDescription>A list of images you have uploaded.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {imagesLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : filteredUserImages.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">You haven't uploaded any images yet.</p>
                            ) : (
                                <div className="max-h-96 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Preview</TableHead>
                                                <TableHead>File Name</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUserImages.map((image) => (
                                                <TableRow key={image.id}>
                                                    <TableCell>
                                                        <Link href={image.downloadURL} target="_blank" rel="noopener noreferrer">
                                                            <Image
                                                                src={image.downloadURL}
                                                                alt={image.fileName}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-md object-cover"
                                                            />
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="font-medium max-w-xs truncate">
                                                        <Link href={image.downloadURL} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                          {image.fileName}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        {image.uploadedAt ? format(new Date(image.uploadedAt.seconds * 1000), 'PP') : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
