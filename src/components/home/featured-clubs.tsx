'use client';
import { useCollection } from '@/firebase';
import type { Club } from '@/lib/types';
import { ClubCard } from '@/components/club-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '../ui/skeleton';

function ClubCardSkeleton() {
    return (
      <div className="flex items-center space-x-4 p-1">
        <Skeleton className="h-[125px] w-full rounded-lg" />
      </div>
    );
}

export function FeaturedClubs() {
  const { data: clubs, loading } = useCollection<Club>('clubs');
  const featuredClubs = clubs.slice(0, 6);

  return (
    <section className="py-12 md:py-16">
      <h2 className="text-3xl font-bold text-center mb-2">Featured Clubs</h2>
      <p className="text-center text-muted-foreground mb-8">Discover a community that shares your passion.</p>
      
      {loading ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <ClubCardSkeleton />
            <ClubCardSkeleton />
            <ClubCardSkeleton />
        </div>
      ) : (
        <Carousel 
            opts={{ align: "start", loop: true }}
            className="w-full"
        >
            <CarouselContent>
            {featuredClubs.map((club) => (
                <CarouselItem key={club.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                    <ClubCard club={club} className="h-full" />
                </div>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:inline-flex" />
            <CarouselNext className="hidden md:inline-flex" />
        </Carousel>
      )}
    </section>
  );
}
