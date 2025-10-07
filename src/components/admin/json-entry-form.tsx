
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  jsonContent: z.string().min(10, { message: "JSON content cannot be empty." }),
});

interface JsonEntryFormProps {
  entityName: string;
  onSubmit: (jsonContent: string) => void;
  isSubmitting: boolean;
}

export function JsonEntryForm({ entityName, onSubmit, isSubmitting }: JsonEntryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { jsonContent: '' },
  });
  
  const placeholder = `[
  {
    "field1": "value1",
    "field2": "value2"
  }
]`;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data.jsonContent))} className="space-y-4">
        <FormField
          control={form.control}
          name="jsonContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>JSON Array of {entityName}s</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={placeholder}
                  className="min-h-64 font-mono text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add {entityName}s
        </Button>
      </form>
    </Form>
  );
}
