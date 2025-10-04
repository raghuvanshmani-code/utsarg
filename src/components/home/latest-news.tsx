import Link from 'next/link';
import { posts } from '@/lib/data';
import { BlogCard } from '@/components/blog-card';
import { Button } from '@/components/ui/button';

export function LatestNews() {
  const latestPosts = posts.slice(0, 3);

  return (
    <section className="py-12 md:py-16">
      <h2 className="text-3xl font-bold text-center mb-2 font-headline">Latest News</h2>
      <p className="text-center text-muted-foreground mb-8">Stay updated with the latest happenings and stories.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {latestPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
      <div className="text-center mt-12">
        <Button asChild size="lg" className="transform transition-transform hover:scale-105">
          <Link href="/blog">Read More Articles</Link>
        </Button>
      </div>
    </section>
  );
}
