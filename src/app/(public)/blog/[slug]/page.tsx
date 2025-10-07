'use client';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, User, Twitter, Facebook, Linkedin } from 'lucide-react';
import { format } from 'date-fns';

import { useDoc } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PostDetailsPage({ params: { slug } }: { params: { slug: string } }) {
  // The slug is the document ID in this case
  const { data: post, loading } = useDoc<Post>(slug ? `blog/${slug}` : null);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-[40vh] w-full" />
        <div className="container mx-auto px-4 py-12 md:py-16 -mt-24 relative">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-lg p-6 md:p-10">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <div className="flex gap-6 mb-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div>
      <section className="relative h-[40vh] w-full flex items-center justify-center text-center text-white">
        {post.bannerImage && (
          <Image
            src={post.bannerImage}
            alt={`${post.title} banner`}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16 -mt-24 relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
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
