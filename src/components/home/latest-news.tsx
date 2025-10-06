'use client';
import Link from 'next/link';
import { useCollection } from '@/firebase';
import type { Post } from '@/lib/types';
import { BlogCard } from '@/components/blog-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '../ui/skeleton';

function BlogCardSkeleton() {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[225px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
}

export function LatestNews() {
  const { data: posts, loading } = useCollection<Post>('blog');
  const latestPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  return (
    <section className="py-16 md:py-24 container mx-auto" data-scroll>
      <h2 className="text-3xl font-bold text-center mb-2">Latest News</h2>
      <p className="text-center text-muted-foreground mb-8">Stay updated with the latest happenings and stories.</p>
       {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <BlogCardSkeleton />
                <BlogCardSkeleton />
                <BlogCardSkeleton />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
                ))}
            </div>
        )}
      <div className="text-center mt-12">
        <Button asChild size="lg" variant="outline" className="transform transition-transform hover:scale-105 rounded-full">
          <Link href="/blog">Read More Articles</Link>
        </Button>
      </div>
    </section>
  );
}
