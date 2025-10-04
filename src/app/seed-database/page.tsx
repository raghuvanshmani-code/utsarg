'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { seedDatabase } from '@/lib/seed';
import { Loader2, PartyPopper } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SeedPage() {
  const db = useFirestore();
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    if (!db) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firestore is not initialized.",
        });
        return;
    }
    setIsSeeding(true);
    try {
      const result = await seedDatabase(db);
      if (result.success) {
        toast({
            title: "Success!",
            description: "Your database has been populated with sample data.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Seeding Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div>
        <PageHeader title="Seed Database" subtitle="Populate your Firestore database with initial sample data." />
        <div className="container mx-auto px-4 py-12 md:py-16">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PartyPopper className="text-primary"/> Populate Database</CardTitle>
                    <CardDescription>
                        Click the button below to add sample clubs, events, blog posts, and gallery images to your Firestore database. 
                        This will allow you to see the website with content. This action can be performed multiple times, but it will overwrite existing data with the same IDs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleSeed} disabled={isSeeding || !db} className="w-full" size="lg">
                        {isSeeding ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding...</>
                        ) : (
                            'Seed Database'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
