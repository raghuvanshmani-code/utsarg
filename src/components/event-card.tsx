'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event, Club } from '@/lib/types';
import { format } from 'date-fns';
import { useDoc } from '@/firebase';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { data: club } = useDoc<Club>(`clubs/${event.clubId}`);

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
        {event.bannerImage && (
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={event.bannerImage}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-lg">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
            </div>
            {club && (
                <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    <span>{club.name}</span>
                </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
            <span className="text-sm text-primary font-semibold flex items-center">
                View Details <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
            </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
