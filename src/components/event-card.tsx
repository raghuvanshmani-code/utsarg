import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Event } from '@/lib/types';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const banner = PlaceHolderImages.find((p) => p.id === event.bannerImage);

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
        {banner && (
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={banner.imageUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={banner.imageHint}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-headline text-lg">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              <span>{event.club}</span>
            </div>
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
