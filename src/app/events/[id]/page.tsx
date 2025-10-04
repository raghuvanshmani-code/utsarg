import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Tag, Ticket } from 'lucide-react';
import { format } from 'date-fns';

import { events, clubs } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export async function generateStaticParams() {
  return events.map((event) => ({
    id: event.id,
  }));
}

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const event = events.find((e) => e.id === params.id);

  if (!event) {
    notFound();
  }

  const club = clubs.find(c => c.slug === event.clubSlug);
  const banner = PlaceHolderImages.find((p) => p.id === event.bannerImage);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[40vh] w-full flex items-center justify-center text-center text-white">
        {banner && (
          <Image
            src={banner.imageUrl}
            alt={`${event.title} banner`}
            fill
            className="object-cover"
            priority
            data-ai-hint={banner.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            {event.title}
          </h1>
        </div>
      </section>

      {/* Event Details */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-headline text-primary mb-4">About the Event</h2>
            <p className="text-muted-foreground text-lg">{event.description}</p>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
             <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
                <Button size="lg" className="w-full text-lg transform transition-transform hover:scale-105">
                    <Ticket className="mr-2 h-5 w-5" /> RSVP / Join Event
                </Button>
                
                <div>
                  <h3 className="text-lg font-semibold font-headline mb-4 border-b pb-2">Details</h3>
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
                        <strong>Location:</strong> {event.location}
                      </div>
                    </li>
                    <li className="flex items-center">
                      <Tag className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <strong>Organized by:</strong> 
                        {club ? 
                          <Link href={`/clubs/${club.slug}`} className="ml-1">
                            <Badge variant="secondary" className="hover:bg-primary/20">{event.club}</Badge>
                          </Link>
                          : <span className="ml-1">{event.club}</span>
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
