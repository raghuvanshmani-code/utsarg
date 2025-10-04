import { PageHeader } from '@/components/page-header';
import { BlogCard } from '@/components/blog-card';
import { posts } from '@/lib/data';

export default function BlogPage() {
  return (
    <div>
      <PageHeader
        title="News & Blog"
        subtitle="Stay in the loop with the latest news, stories, and announcements from the UTSARG community."
      />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
