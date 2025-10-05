import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Club } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ClubCardProps {
  club: Club;
  className?: string;
}

export function ClubCard({ club, className }: ClubCardProps) {

  return (
    <Link href={`/clubs/${club.id}`} className="group block h-full">
        <Card className={cn("h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 flex flex-col", className)}>
            <CardHeader className="flex flex-row items-center gap-4">
            {club.logo && (
                <Image
                src={club.logo}
                alt={`${club.name} logo`}
                width={64}
                height={64}
                className="rounded-lg object-cover"
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
