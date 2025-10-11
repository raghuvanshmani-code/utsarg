
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Event, Club } from '@/lib/types';
import { useEffect, useState } from 'react';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCollection } from '@/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { ImageUploader } from '../image-uploader';

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  venue: z.string().min(2, { message: "Location must be at least 2 characters." }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  clubId: z.string().optional(),
  organizer: z.string().optional(),
  bannerImage: z.string().optional(),
}).refine(data => data.clubId || data.organizer, {
    message: "Either an organizing club must be selected or a custom organizer must be specified.",
    path: ["organizer"],
});


interface EventFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  event: Event | null;
  isSubmitting: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isDialog?: boolean;
}

export function EventForm({ isOpen, onOpenChange, onSubmit, event, isSubmitting, isDialog = false }: EventFormProps) {
  const { data: clubs, loading: clubsLoading } = useCollection<Club>('clubs');
  const [isClient, setIsClient] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', venue: '', date: new Date().toISOString(), clubId: '', organizer: '', bannerImage: '' },
  });

  useEffect(() => {
    setIsClient(true);
    if (isOpen) {
        if (event) {
            form.reset({ ...event, date: event.date || new Date().toISOString(), venue: event.venue || '' });
        } else {
            form.reset({ title: '', description: '', venue: '', date: new Date().toISOString(), clubId: '', organizer: '', bannerImage: '' });
        }
    }
  }, [event, isOpen, form]);

  const handleSave = form.handleSubmit(data => {
    const submitData = { ...data, location: data.venue };
    onSubmit(submitData);
  });

  if (!isClient) {
    return null;
  }

  const dialogTitle = event ? 'Edit Event' : 'Add New Event';
  const dialogDescription = event ? 'Make changes to the event details here.' : 'Add a new event.';

  const formContent = (
    <Form {...form}>
      <form className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Event Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="venue" render={({ field }) => (<FormItem><FormLabel>Location / Venue</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? (format(new Date(field.value), "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={new Date(field.value)} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="clubId" render={({ field }) => (<FormItem><FormLabel>Organizing Club (Optional)</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={clubsLoading}><FormControl><SelectTrigger><SelectValue placeholder="Select a club" /></SelectTrigger></FormControl><SelectContent><SelectItem value="">None</SelectItem>{clubs.map(club => (<SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="organizer" render={({ field }) => (<FormItem><FormLabel>Or Custom Organizer Name</FormLabel><FormControl><Input placeholder="e.g., Alumni Committee" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="bannerImage" render={({ field }) => (<FormItem><FormLabel>Banner Image</FormLabel><FormControl><ImageUploader value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
        
        {!isDialog && (
          <Button type="button" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {event ? 'Update Event' : 'Add Event'}
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
            <Button type="button" onClick={handleSave} disabled={isSubmitting}>
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
