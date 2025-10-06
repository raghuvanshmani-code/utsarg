'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TypeAnimation } from 'react-type-animation';
import Image from 'next/image';

export function HeroSection() {
  const heroImage = "https://res.cloudinary.com/dsot9i4o6/image/upload/v1759764366/IMG_0698_ffnomp.jpg";

  return (
    <section 
      className="relative h-[70vh] md:h-[90vh] w-full flex items-center justify-center text-center text-white overflow-hidden"
    >
       <Image
        src={heroImage}
        alt="UTSARG students"
        fill
        className="object-cover"
        priority
       />
       <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500/70 via-red-500/70 to-yellow-500/70 animate-gradient-x" />
       <div className="absolute inset-0 bg-black/30" />


      <div className="relative z-10 container mx-auto px-4">
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 ease-in-out">
             <TypeAnimation
                sequence={[
                    'UTSARG',
                    1000,
                    'UNITE.TSARG',
                    1000,
                    'CREATE.SARG',
                    1000,
                    'INSPIRE.SARG',
                    1000,
                ]}
                wrapper="h1"
                speed={50}
                className="text-6xl md:text-9xl font-extrabold tracking-tighter leading-tight text-white"
                repeat={Infinity}
                />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400 ease-in-out">
            <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto text-white/90">
            Connecting GSVM’s student communities, events & stories.
            </p>
        </div>
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-14 duration-1000 delay-600 ease-in-out">
          <Button asChild size="lg" variant="accent" className="transform transition-transform hover:scale-105 rounded-full">
            <Link href="/clubs">Explore Our World</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
