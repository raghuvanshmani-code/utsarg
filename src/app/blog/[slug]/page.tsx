import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, User, Twitter, Facebook, Linkedin } from 'lucide-react';
import { format } from 'date-fns';

import { posts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function PostDetailsPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const banner = PlaceHolderImages.find((p) => p.id === post.bannerImage);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[40vh] w-full flex items-center justify-center text-center text-white">
        {banner && (
          <Image
            src={banner.imageUrl}
            alt={`${post.title} banner`}
            fill
            className="object-cover"
            priority
            data-ai-hint={banner.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </section>

      {/* Post Content */}
      <div className="container mx-auto px-4 py-12 md:py-16 -mt-24 relative">
        <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-lg p-6 md:p-10">
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">
                    {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center"><User className="h-4 w-4 mr-2" /> {post.author}</span>
                    <span className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {format(new Date(post.date), 'MMMM do, yyyy')}</span>
                </div>

                <article 
                    className="prose dark:prose-invert max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="font-semibold">Share this post:</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon"><Twitter className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon"><Facebook className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon"><Linkedin className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
