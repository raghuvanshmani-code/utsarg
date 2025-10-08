
'use client';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Calendar, MapPin, Tag, Ticket } from 'lucide-react';
import { format } from 'date-fns';

import { useDoc } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Event, Club } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: event, loading: eventLoading } = useDoc<Event>(`events/${id}`);
  
  // Conditionally fetch the club only when the event data (and thus event.clubId) is available.
  const { data: club, loading: clubLoading } = useDoc<Club>(event?.clubId ? `clubs/${event.clubId}` : null);

  if (eventLoading || (event && !club && !clubLoading)) {
    return (
        <div>
            <Skeleton className="h-[40vh] w-full" />
             <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
  }

  if (!event) {
    notFound();
  }

  return (
    <div>
      <section className="relative h-[40vh] w-full flex items-center justify-center text-center text-white">
        {event.bannerImage && (
          <Image
            src={event.bannerImage}
            alt={`${event.title} banner`}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {event.title}
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-primary mb-4">About the Event</h2>
            <p className="text-muted-foreground text-lg">{event.description}</p>
          </div>
          
          <div className="lg:col-span-1">
             <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
                <Button size="lg" className="w-full text-lg transform transition-transform hover:scale-105">
                    <Ticket className="mr-2 h-5 w-5" /> RSVP / Join Event
                </Button>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Details</h3>
                  <ul className="space-y-4 text-muted-foreground">
                    <li className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <strong>Date:</strong> {format(new Date(event.date), 'EEEE, MMMM do, yyyy')}
                      </div>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <strong>Location:</strong> {event.venue}
                      </div>
                    </li>
                    <li className="flex items-center">
                      <Tag className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <strong>Organized by:</strong> 
                        {club ? 
                          <Link href={`/clubs/${club.id}`} className="ml-1">
                            <Badge variant="secondary" className="hover:bg-primary/20">{club.name}</Badge>
                          </Link>
                          : <span className="ml-1">{event.clubId}</span>
                        }
                      </div>
                    </li>
                  </ul>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
