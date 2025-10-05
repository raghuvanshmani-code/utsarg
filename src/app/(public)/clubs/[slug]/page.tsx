'use client';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle, PartyPopper } from 'lucide-react';

import { useDoc, useCollection } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import type { Club, Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function ClubDetailsPage({ params }: { params: { slug: string } }) {
  const { data: club, loading: clubLoading } = useDoc<Club>(`clubs/${params.slug}`);
  const { data: clubEvents, loading: eventsLoading } = useCollection<Event>(`events`); // Simplified query

  if (clubLoading || eventsLoading) {
    return (
        <div>
            <Skeleton className="h-[40vh] w-full" />
             <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-8">
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

  if (!club) {
    notFound();
  }
  
  const filteredEvents = clubEvents.filter(e => e.clubId === club.id);
  const banner = PlaceHolderImages.find((p) => p.id === club.bannerImage);

  return (
    <div>
      <section className="relative h-[40vh] w-full flex items-center justify-center text-center text-white">
        {banner && (
          <Image
            src={banner.imageUrl}
            alt={`${club.name} banner`}
            fill
            className="object-cover"
            priority
            data-ai-hint={banner.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            {club.name}
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold font-headline text-primary mb-4">About the Club</h2>
              <p className="text-muted-foreground text-lg">{club.description}</p>
            </div>
            
            {club.achievements && club.achievements.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-headline text-primary mb-4">Our Achievements</h2>
                <ul className="space-y-3">
                  {club.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
             <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold font-headline mb-4">Get Involved!</h3>
                <p className="text-muted-foreground mb-6">Ready to join the fun? Contact us to learn more about membership and our activities.</p>
                <Button size="lg" className="w-full transform transition-transform hover:scale-105">
                    Contact Us
                </Button>
             </div>
          </div>
        </div>
        
        {filteredEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">
              <PartyPopper className="h-8 w-8 inline-block mr-2 text-primary" />
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
