
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { GalleryImage } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  mediaURL: z.string().optional(),
  type: z.enum(['image', 'video'], { required_error: "You need to select a media type."}),
});

interface GalleryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  item: GalleryImage | null;
  isSubmitting: boolean;
}

const CLOUDINARY_CLOUD_NAME = 'dsot9i4o6';
const CLOUDINARY_UPLOAD_PRESET = 'Utsarg';

const ImageUploadField = ({
  form,
  fieldName,
  label,
}: {
  form: any;
  fieldName: 'mediaURL';
  label: string;
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const currentUrl = form.watch(fieldName);

  const handleFileUpload = async (file: File) => {
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
      const data = await response.json();
      if (data.secure_url) {
        form.setValue(fieldName, data.secure_url, { shouldValidate: true });
        toast({ title: 'Success', description: 'Image uploaded successfully.' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Image upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div>
          {currentUrl && (
            <div className="mb-2">
              <Image src={currentUrl} alt={label} width={100} height={100} className="rounded-md object-cover" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="sr-only"
              id={`${fieldName}-upload`}
              disabled={uploading}
            />
            <label htmlFor={`${fieldName}-upload`} className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : currentUrl ? 'Change' : 'Upload'}
            </label>
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};


export function GalleryForm({ isOpen, onOpenChange, onSubmit, item, isSubmitting }: GalleryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    if (isOpen) {
      if (item) {
        form.reset(item);
      } else {
        form.reset({
          title: '',
          mediaURL: '',
          type: 'image',
        });
      }
    }
  }, [item, form, isOpen]);


  const dialogTitle = item ? 'Edit Gallery Item' : 'Add New Gallery Item';
  const dialogDescription = item ? 'Make changes to the item details here.' : 'Add a new item to the gallery.';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mediaURL"
              render={({ field }) => (
                 <ImageUploadField form={form} fieldName="mediaURL" label="Image" />
              )}
            />
            
             <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Media Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="image" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Image
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="video" disabled />
                        </FormControl>
                        <FormLabel className="font-normal text-muted-foreground">
                          Video (coming soon)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sticky bottom-0 bg-background pt-4 -mx-6 px-6">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
