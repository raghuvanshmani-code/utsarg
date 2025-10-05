'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: string | undefined;
  onChange: (value: string) => void;
  folder?: string;
}

const CLOUDINARY_CLOUD_NAME = 'dsot9i4o6';
const CLOUDINARY_UPLOAD_PRESET = 'Utsarg';

export function ImageUploader({ value, onChange, folder = 'my_project_uploads' }: ImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputId = `file-upload-${Math.random()}`;

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

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
      if (data.secure_url) {
        onChange(data.secure_url);
        toast({ title: 'Success', description: 'Image uploaded successfully.' });
      } else {
        throw new Error('Upload failed: No secure_url returned.');
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Image upload failed.' });
      // Clear the value on error to avoid broken image links
      onChange('');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  
  const isPreviewUrlValid = value && (value.startsWith('http://') || value.startsWith('https://'));

  return (
    <div>
      {isPreviewUrlValid ? (
        <div className="relative group">
          <Image
            src={value}
            alt="Image preview"
            width={400}
            height={400}
            className="w-full h-auto max-h-48 object-contain rounded-md border p-2 bg-muted/50"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange('')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            id={fileInputId}
            disabled={uploading}
          />
          <label htmlFor={fileInputId} className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </label>
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      )}
    </div>
  );
}
