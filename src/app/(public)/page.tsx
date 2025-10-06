import { HeroSection } from '@/components/home/hero-section';
import { FeaturedClubs } from '@/components/home/featured-clubs';
import { UpcomingEvents } from '@/components/home/upcoming-events';
import { LatestNews } from '@/components/home/latest-news';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <section id="mission" className="py-16 md:py-24 text-center container" data-scroll>
        <h2 className="text-3xl font-bold mb-4">What We Do</h2>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
            UTSARG is the official student committee of GSVM Medical College, dedicated to enriching the student experience. We foster a vibrant community by providing a platform for students to explore interests, develop talents, and create lasting memories.
        </p>
         <Button asChild>
            <Link href="/about">Learn More About Us</Link>
          </Button>
      </section>
      <UpcomingEvents />
      <FeaturedClubs />
      <LatestNews />
    </div>
  );
}
