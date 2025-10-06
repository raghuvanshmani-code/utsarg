
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const heroImage = "https://res.cloudinary.com/dsot9i4o6/image/upload/v1759734096/GSVM-Medical-College-Kanpur-Banner_qoyhye.webp";

  return (
    <section 
      className="relative h-[70vh] md:h-[90vh] w-full flex items-center justify-center text-center text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 container mx-auto px-4">
        <p className="text-lg md:text-xl font-semibold text-neutral-300 mb-2">The Official Student Committee of GSVM Medical College</p>
        <h1 className="text-5xl md:text-8xl font-extrabold font-headline tracking-tighter leading-tight text-white">
          UTSARG
        </h1>
        <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto text-white/90">
          Where Student Life Ascends.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="transform transition-transform hover:scale-105">
            <Link href="/clubs">Explore Our World</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
