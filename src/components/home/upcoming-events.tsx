'use client';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import type { Event } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '../ui/skeleton';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

function EventCardSkeleton() {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[225px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
}

export function UpcomingEvents() {
  const db = useFirestore();
  const eventsQuery = db ? query(collection(db, 'events'), where('date', '>=', new Date().toISOString()), orderBy('date', 'asc'), limit(3)) : null;
  const { data: events, loading } = useCollection<Event>(eventsQuery);
  
  return (
    <section className="py-16 md:py-24" data-scroll>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Upcoming Events</h2>
        <p className="text-center text-muted-foreground mb-8">Don't miss out on what's happening on campus.</p>
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
            </div>
        )}
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline" className="transform transition-transform hover:scale-105 rounded-full">
            <Link href="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
