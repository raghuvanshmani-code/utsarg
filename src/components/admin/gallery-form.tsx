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
import { ImageUploader } from '../image-uploader';


const formSchema = z.object({
  caption: z.string().min(2, { message: "Caption must be at least 2 characters." }).optional(),
  url: z.string().url({ message: "Please enter a valid URL." }),
  tags: z.array(z.string()).optional(),
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
      caption: '',
      url: '',
      tags: [],
    }
  });
  
  useEffect(() => {
    if (isOpen) {
      if (item) {
        form.reset(item);
      } else {
        form.reset({
          caption: '',
          url: '',
          tags: [],
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
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                 <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUploader 
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="sticky bottom-0 bg-background pt-4 -mx-6 px-6 pb-6">
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
