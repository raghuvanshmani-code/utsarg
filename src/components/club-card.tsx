import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
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
        <Card className={cn("h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-accent hover:-translate-y-1 flex flex-col shadow-lg", className)}>
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
                <CardTitle>{club.name}</CardTitle>
                {club.members_count && (
                    <span className="text-xs text-muted-foreground flex items-center mt-1">
                        <Users className="h-3 w-3 mr-1.5" />
                        {club.members_count} Members
                    </span>
                )}
            </div>
            </CardHeader>
            <CardContent className="flex-grow">
            <CardDescription>{club.short_description}</CardDescription>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-accent font-semibold flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  View More <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardFooter>
        </Card>
    </Link>
  );
}
