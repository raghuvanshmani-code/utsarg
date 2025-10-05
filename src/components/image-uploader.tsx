
'use client';
import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useStorage } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { UploadCloud, Image as ImageIcon, XCircle } from 'lucide-react';
import Image from 'next/image';
import { Card } from './ui/card';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string | null;
}

export function ImageUploader({ onUploadComplete, currentImageUrl }: ImageUploaderProps) {
  const storage = useStorage();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !storage) return;

    if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    const reader = new FileReader();
    reader.onloadend = () => {
        setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        setError('Upload failed. Please try again.');
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onUploadComplete(downloadURL);
          setUploading(false);
        });
      }
    );
  };
  
  const handleRemoveImage = () => {
      setPreview(null);
      onUploadComplete('');
  }
  
  const isPreviewUrlValid = preview && (preview.startsWith('http://') || preview.startsWith('https://') || preview.startsWith('data:image'));

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
        <div className="space-y-1">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
        </div>
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <label htmlFor="file-upload" className="cursor-pointer">
            <UploadCloud className="mr-2 h-4 w-4" />
            {preview ? 'Change Image' : 'Upload Image'}
            <input id="file-upload" type="file" onChange={handleFileChange} disabled={uploading} className="sr-only" />
          </label>
        </Button>
      </div>
    </Card>
  );
}
