import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function HeroSection() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-banner');

  return (
    <section className="relative h-[70vh] md:h-[90vh] w-full flex items-center justify-center text-center text-white">
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
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 container mx-auto px-4">
        <p className="text-lg md:text-xl font-semibold text-primary mb-2 animate-fade-in-up">The Official Student Committee of GSVM Medical College</p>
        <h1 className="text-5xl md:text-8xl font-extrabold font-headline tracking-tighter leading-tight animate-fade-in-up animation-delay-200">
          UTSARG
        </h1>
        <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto text-neutral-200 animate-fade-in-up animation-delay-400">
          Where Student Life Ascends.
        </p>
        <div className="mt-8 animate-fade-in-up animation-delay-600">
          <Button asChild size="lg" className="transform transition-transform hover:scale-105 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            <Link href="/clubs">Explore Our World</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

    