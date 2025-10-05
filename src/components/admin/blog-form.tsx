
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Post } from '@/lib/types';
import { useState, useEffect } from 'react';
import { CalendarIcon, Loader2, UploadCloud } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  summary: z.string().min(10, { message: "Summary must be at least 10 characters." }),
  author: z.string().min(2, { message: "Author name must be at least 2 characters." }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  thumbnail: z.string().optional(),
  bannerImage: z.string().optional(),
  content: z.string().min(20, { message: "Content must be at least 20 characters." }),
});

interface BlogFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  post: Post | null;
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
  fieldName: 'thumbnail' | 'bannerImage';
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


export function BlogForm({ isOpen, onOpenChange, onSubmit, post, isSubmitting }: BlogFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (post) {
        form.reset(post);
      } else {
        form.reset({
          title: '',
          summary: '',
          author: '',
          date: new Date().toISOString(),
          thumbnail: '',
          bannerImage: '',
          content: '',
        });
      }
    }
  }, [post, form, isOpen]);


  const dialogTitle = post ? 'Edit Post' : 'Add New Post';
  const dialogDescription = post ? 'Make changes to the post details here.' : 'Add a new post to the blog.';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
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
                  <FormLabel>Post Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Publication Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(field.value)}
                        onSelect={(date) => field.onChange(date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ImageUploadField form={form} fieldName="thumbnail" label="Thumbnail Image" />
            <ImageUploadField form={form} fieldName="bannerImage" label="Banner Image" />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl><Textarea {...field} rows={10} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sticky bottom-0 bg-background pt-4">
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
