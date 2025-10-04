import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function HeroSection() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-banner');

  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight leading-tight">
          UTSARG Student Committee
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-neutral-200">
          Connecting students through diverse clubs and activities at GSVM Medical College.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="transform transition-transform hover:scale-105">
            <Link href="/clubs">Explore Clubs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
