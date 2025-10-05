import { HeroSection } from '@/components/home/hero-section';
import { FeaturedClubs } from '@/components/home/featured-clubs';
import { UpcomingEvents } from '@/components/home/upcoming-events';
import { LatestNews } from '@/components/home/latest-news';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <FeaturedClubs />
        <UpcomingEvents />
        <LatestNews />
      </div>
    </div>
  );
}
