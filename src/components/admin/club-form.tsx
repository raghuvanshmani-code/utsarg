
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Club } from '@/lib/types';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  logo: z.string().min(1, { message: "Please select a logo." }),
  bannerImage: z.string().min(1, { message: "Please select a banner image." }),
});

interface ClubFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  club: Club | null;
  isSubmitting: boolean;
}

const clubLogos = PlaceHolderImages.filter(p => p.id.includes('-logo'));
const clubBanners = PlaceHolderImages.filter(p => p.id.includes('club-banner'));

export function ClubForm({ isOpen, onOpenChange, onSubmit, club, isSubmitting }: ClubFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      logo: '',
      bannerImage: '',
    },
  });

  useEffect(() => {
    if (club) {
      form.reset(club);
    } else {
      form.reset({ name: '', description: '', logo: '', bannerImage: '' });
    }
  }, [club, form]);

  const dialogTitle = club ? 'Edit Club' : 'Add New Club';
  const dialogDescription = club ? 'Make changes to the club details here. Click save when you\'re done.' : 'Add a new club to the list. Fill in the details and click save.';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club Name</FormLabel>
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
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo Image</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a logo image" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clubLogos.map(logo => (
                        <SelectItem key={logo.id} value={logo.id}>
                          {logo.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="bannerImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a banner image" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clubBanners.map(banner => (
                        <SelectItem key={banner.id} value={banner.id}>
                          {banner.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
