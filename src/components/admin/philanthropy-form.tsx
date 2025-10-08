
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PhilanthropyActivity } from '@/lib/types';
import { useEffect, useState } from 'react';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { ImageUploader } from '../image-uploader';

const formSchema = z.object({
  type: z.string().min(2, { message: "Type must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  imageUrl: z.string().optional(),
  volunteers: z.array(z.string()).optional(),
});

interface PhilanthropyFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  activity: PhilanthropyActivity | null;
  isSubmitting: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isDialog?: boolean;
}

export function PhilanthropyForm({ isOpen, onOpenChange, onSubmit, activity, isSubmitting, isDialog = false }: PhilanthropyFormProps) {
  const [isClient, setIsClient] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: '', description: '', date: new Date().toISOString(), imageUrl: '', volunteers: [] },
  });

  useEffect(() => {
    setIsClient(true);
    if (isOpen) {
      if (activity) {
        form.reset({ ...activity, date: activity.date || new Date().toISOString() });
      } else {
        form.reset({ type: '', description: '', date: new Date().toISOString(), imageUrl: '', volunteers: [] });
      }
    }
  }, [activity, form, isOpen]);


  if (!isClient) {
    return null;
  }

  const dialogTitle = activity ? 'Edit Activity' : 'Add New Activity';
  const dialogDescription = activity ? 'Make changes to the activity details here.' : 'Add a new philanthropic activity.';

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => { onSubmit(data); if (!activity) form.reset(); })} className="space-y-4">
        <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Activity Type</FormLabel><FormControl><Input placeholder="e.g., Blood Donation Camp" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? (format(new Date(field.value), "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Image (Optional)</FormLabel><FormControl><ImageUploader value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
        
        {!isDialog && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activity ? 'Update Activity' : 'Add Activity'}
          </Button>
        )}
      </form>
    </Form>
  );

  if (isDialog && onOpenChange) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle><DialogDescription>{dialogDescription}</DialogDescription></DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto pr-6 -mr-6">{formContent}</div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="button" onClick={form.handleSubmit(data => { onSubmit(data); if (!activity) form.reset(); })} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
