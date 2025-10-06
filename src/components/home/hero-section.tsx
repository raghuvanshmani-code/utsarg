'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const heroImage = "https://res.cloudinary.com/dsot9i4o6/image/upload/v1759764366/IMG_0698_ffnomp.jpg";

  return (
    <section 
      className="relative h-[70vh] md:h-[90vh] w-full flex items-center justify-center text-center text-white bg-cover bg-center overflow-hidden"
    >
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 ease-in-out">
            <h1 className="text-6xl md:text-9xl font-extrabold tracking-tighter leading-tight text-white">
            UTSARG
            </h1>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400 ease-in-out">
            <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto text-white/90">
            Connecting GSVM’s student communities, events & stories.
            </p>
        </div>
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-14 duration-1000 delay-600 ease-in-out">
          <Button asChild size="lg" variant="accent" className="transform transition-transform hover:scale-105">
            <Link href="/clubs">Explore Our World</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
