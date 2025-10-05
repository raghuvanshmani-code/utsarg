
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Event, Club } from '@/lib/types';
import { useState, useEffect } from 'react';
import { CalendarIcon, Loader2, UploadCloud } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCollection } from '@/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  clubId: z.string().min(1, { message: "Please select a club." }),
  bannerImage: z.string().optional(),
});

interface EventFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  event: Event | null;
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
  fieldName: 'bannerImage';
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


export function EventForm({ isOpen, onOpenChange, onSubmit, event, isSubmitting }: EventFormProps) {
  const { data: clubs, loading: clubsLoading } = useCollection<Club>('clubs');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (event) {
        form.reset(event);
      } else {
        form.reset({
          title: '',
          description: '',
          location: '',
          date: new Date().toISOString(),
          clubId: '',
          bannerImage: '',
        });
      }
    }
  }, [event, form, isOpen]);


  const dialogTitle = event ? 'Edit Event' : 'Add New Event';
  const dialogDescription = event ? 'Make changes to the event details here. Click save when you\'re done.' : 'Add a new event. Fill in the details and click save.';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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
                  <FormLabel>Event Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
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
                  <FormLabel>Date</FormLabel>
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
            <FormField
              control={form.control}
              name="clubId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizing Club</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={clubsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a club" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clubs.map(club => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <ImageUploadField form={form} fieldName="bannerImage" label="Banner Image" />

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
