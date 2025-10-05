import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
  const aboutBanner = PlaceHolderImages.find(p => p.id === 'about-banner');

  return (
    <div>
      <PageHeader
        title="About UTSARG"
        subtitle="The heart of student life at GSVM Medical College."
      />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary font-headline mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg mb-6">
              UTSARG is the official student committee of GSVM Medical College, dedicated to enriching the student experience. Our mission is to foster a vibrant and inclusive campus community by providing a platform for students to explore their interests, develop their talents, and create lasting memories.
            </p>
            <p className="text-muted-foreground">
              We act as the bridge between the students and the college administration, ensuring that student voices are heard and their needs are met. Through a diverse range of clubs, events, and initiatives, we aim to promote holistic development, leadership, and a sense of belonging among all students.
            </p>
          </div>
          <div>
            {aboutBanner && (
              <Image 
                src={aboutBanner.imageUrl}
                alt={aboutBanner.description}
                width={600}
                height={400}
                className="rounded-lg shadow-lg object-cover"
                data-ai-hint={aboutBanner.imageHint}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
