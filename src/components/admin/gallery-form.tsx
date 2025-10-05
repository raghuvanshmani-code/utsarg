
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { GalleryImage } from '@/lib/types';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ImageUploader } from '../image-uploader';

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  mediaURL: z.string().min(1, { message: "Please upload a valid image." }),
  type: z.enum(['image', 'video'], { required_error: "You need to select a media type."}),
});

interface GalleryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  item: GalleryImage | null;
  isSubmitting: boolean;
}

export function GalleryForm({ isOpen, onOpenChange, onSubmit, item, isSubmitting }: GalleryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      mediaURL: '',
      type: 'image',
    },
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FormItem>
                  <FormLabel>Image</FormLabel>
                   <FormControl>
                    <ImageUploader 
                        onUploadComplete={(url) => field.onChange(url)}
                        currentImageUrl={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
            <DialogFooter>
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
