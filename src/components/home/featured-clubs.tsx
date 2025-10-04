import { clubs } from '@/lib/data';
import { ClubCard } from '@/components/club-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export function FeaturedClubs() {
  const featuredClubs = clubs.slice(0, 6);

  return (
    <section className="py-12 md:py-16">
      <h2 className="text-3xl font-bold text-center mb-2 font-headline">Featured Clubs</h2>
      <p className="text-center text-muted-foreground mb-8">Discover a community that shares your passion.</p>
      
      <Carousel 
        opts={{ align: "start", loop: true }}
        className="w-full"
      >
        <CarouselContent>
          {featuredClubs.map((club) => (
            <CarouselItem key={club.slug} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <ClubCard club={club} className="h-full" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:inline-flex" />
        <CarouselNext className="hidden md:inline-flex" />
      </Carousel>
    </section>
  );
}
