
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FundTransaction } from '@/lib/types';
import { useEffect, useState } from 'react';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { ImageUploader } from '../image-uploader';

const formSchema = z.object({
  purpose: z.string().min(2, { message: "Purpose must be at least 2 characters." }),
  source: z.string().min(2, { message: "Source must be at least 2 characters." }),
  amount: z.coerce.number(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  signatories: z.array(z.string()).optional(), // Making optional for simplicity
  imageUrl: z.string().optional(),
});

interface FinanceFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  transaction: FundTransaction | null;
  isSubmitting: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isDialog?: boolean;
}

export function FinanceForm({ isOpen, onOpenChange, onSubmit, transaction, isSubmitting, isDialog = false }: FinanceFormProps) {
  const [isClient, setIsClient] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { purpose: '', source: '', amount: 0, date: new Date().toISOString(), signatories: [], imageUrl: '' },
  });

  useEffect(() => {
    setIsClient(true);
    if (isOpen) {
        if (transaction) {
            form.reset({ ...transaction, date: transaction.date || new Date().toISOString() });
        } else {
            form.reset({ purpose: '', source: '', amount: 0, date: new Date().toISOString(), signatories: [], imageUrl: '' });
        }
    }
  }, [transaction, form, isOpen]);

  if (!isClient) {
    return null;
  }

  const dialogTitle = transaction ? 'Edit Transaction' : 'Add New Transaction';
  const dialogDescription = transaction ? 'Make changes to the transaction details here.' : 'Add a new transaction to the records.';

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => { onSubmit(data); if (!transaction) form.reset(); })} className="space-y-4">
        <FormField control={form.control} name="purpose" render={({ field }) => (<FormItem><FormLabel>Purpose</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="source" render={({ field }) => (<FormItem><FormLabel>Source/Recipient</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount (use negative for expenses)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Transaction Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? (format(new Date(field.value), "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Receipt/Image (Optional)</FormLabel><FormControl><ImageUploader value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
        
        {!isDialog && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {transaction ? 'Update Transaction' : 'Add Transaction'}
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
            <Button type="button" onClick={form.handleSubmit(data => { onSubmit(data); if (!transaction) form.reset(); })} disabled={isSubmitting}>
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
