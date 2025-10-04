import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Club } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ClubCardProps {
  club: Club;
  className?: string;
}

export function ClubCard({ club, className }: ClubCardProps) {
  const logo = PlaceHolderImages.find((p) => p.id === club.logo);

  return (
    <Link href={`/clubs/${club.slug}`} className="group block h-full">
        <Card className={cn("h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 flex flex-col", className)}>
            <CardHeader className="flex flex-row items-center gap-4">
            {logo && (
                <Image
                src={logo.imageUrl}
                alt={`${club.name} logo`}
                width={64}
                height={64}
                className="rounded-lg object-cover"
                data-ai-hint={logo.imageHint}
                />
            )}
            <div className='w-full'>
                <CardTitle className="font-headline">{club.name}</CardTitle>
            </div>
            </CardHeader>
            <CardContent className="flex-grow">
            <CardDescription>{club.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0 h-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
        </Card>
    </Link>
  );
}

    