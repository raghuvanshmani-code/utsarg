
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, Image as ImageIcon, XCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Card } from './ui/card';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string | null;
}

export function ImageUploader({ onUploadComplete, currentImageUrl }: ImageUploaderProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // --- IMPORTANT: Cloudinary Details ---
  const CLOUDINARY_CLOUD_NAME = 'dsot9i4o6';
  const CLOUDINARY_UPLOAD_PRESET = 'Utsarg';
  // ------------------------------------

  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "User not authenticated."
        });
        return;
    }

    if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
        setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

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
        const { secure_url } = data;
        
        onUploadComplete(secure_url);
        toast({
            title: 'Upload Successful!',
            description: 'Image is ready to be saved.',
        });

    } catch (error: any) {
        console.error("Upload process failed:", error);
        setError(error.message || 'Upload failed. Please try again.');
        setPreview(currentImageUrl || null); // Revert preview on failure
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setUploading(false);
    }
  };
  
  const handleRemoveImage = () => {
      setPreview(null);
      onUploadComplete('');
  }
  
  const isPreviewUrlValid = preview && (preview.startsWith('http') || preview.startsWith('data:image'));

  return (
    <Card className="p-4 space-y-4">
      {isPreviewUrlValid ? (
        <div className="relative group">
          <Image
            src={preview}
            alt="Image preview"
            width={400}
            height={200}
            className="rounded-md object-cover w-full aspect-video"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemoveImage}
            disabled={uploading}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full aspect-video bg-muted rounded-md flex flex-col items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">No image selected</p>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
        </div>
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-center">
        <Button asChild variant="outline" disabled={uploading}>
          <label htmlFor="file-upload" className="cursor-pointer">
            <UploadCloud className="mr-2 h-4 w-4" />
            {preview ? 'Change Image' : 'Upload Image'}
            <input id="file-upload" type="file" onChange={handleFileChange} disabled={uploading} className="sr-only" accept="image/*" />
          </label>
        </Button>
      </div>
    </Card>
  );
}
