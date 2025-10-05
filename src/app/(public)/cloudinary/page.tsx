'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CloudinaryUploadPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    // --- IMPORTANT: REPLACE WITH YOUR CLOUDINARY DETAILS ---
    const CLOUDINARY_CLOUD_NAME = '<CLOUD_NAME>';
    const CLOUDINARY_UPLOAD_PRESET = '<UPLOAD_PRESET>';
    // ----------------------------------------------------

    if (!user && !userLoading) {
      router.push('/login?redirect=/cloudinary');
      return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadedImageUrl(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({ variant: 'destructive', title: 'No file selected' });
            return;
        }
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore service is not available.' });
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'my_project_uploads');

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'Cloudinary upload failed.');
            }

            const data = await response.json();
            const { secure_url, public_id } = data;

            // Save metadata to Firestore
            await addDoc(collection(firestore, 'uploads'), {
                secure_url,
                public_id,
                uploadedAt: serverTimestamp(),
                uploaderUid: user?.uid, // Optional: track who uploaded it
            });

            setUploadedImageUrl(secure_url);
            toast({
                title: 'Upload Successful!',
                description: 'Your image has been uploaded and its URL is saved.',
            });

        } catch (error: any) {
            console.error("Upload process failed:", error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setUploading(false);
            setFile(null);
        }
    };

    if (userLoading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
    }
    
    return (
        <div>
            <PageHeader
                title="Cloudinary Image Upload"
                subtitle="Upload an image directly to Cloudinary and save its metadata to Firestore."
            />
            <div className="container mx-auto px-4 py-12 md:py-16">
                <Card className="max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle>Upload New Image</CardTitle>
                        <CardDescription>Select an image to upload to your Cloudinary account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Input type="file" onChange={handleFileChange} accept="image/*" disabled={uploading} />
                           {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
                        </div>
                        
                        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                            {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
                        </Button>
                        
                        {uploadedImageUrl && (
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-center">Upload Complete!</h3>
                                <div className="rounded-md overflow-hidden border p-2">
                                     <Image
                                        src={uploadedImageUrl}
                                        alt="Uploaded image preview"
                                        width={500}
                                        height={300}
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground break-all">URL: {uploadedImageUrl}</p>
                            </div>
                        )}

                        <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground flex items-start gap-3">
                            <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                            <div>
                                This form uses an unsigned upload preset. Ensure you have created a preset named <strong>`{CLOUDINARY_UPLOAD_PRESET}`</strong> in your Cloudinary account settings.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
