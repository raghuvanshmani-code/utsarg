'use client';
import { PageHeader } from '@/components/page-header';
import { BlogCard } from '@/components/blog-card';
import { useCollection } from '@/firebase';
import { Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function BlogPage() {
  const { data: posts, loading } = useCollection<Post>('blog');

  return (
    <div>
      <PageHeader
        title="News & Blog"
        subtitle="Stay in the loop with the latest news, stories, and announcements from the UTSARG community."
      />
      <div className="container mx-auto px-4 py-12 md:py-16">
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <BlogCardSkeleton />
                <BlogCardSkeleton />
                <BlogCardSkeleton />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
            ))}
            </div>
        )}
      </div>
    </div>
  );
}
