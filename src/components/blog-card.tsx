import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Post } from '@/lib/types';
import { format } from 'date-fns';

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  const thumbnail = PlaceHolderImages.find((p) => p.id === post.thumbnail);

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
        <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
            {thumbnail && (
            <div className="aspect-video relative overflow-hidden">
                <Image
                src={thumbnail.imageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={thumbnail.imageHint}
                />
            </div>
            )}
            <CardHeader>
                <div className="text-xs text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center"><User className="h-3 w-3 mr-1.5" /> {post.author}</span>
                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1.5" /> {format(new Date(post.date), 'MMM dd, yyyy')}</span>
                </div>
                <CardTitle className="font-headline text-lg mt-2">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <CardDescription>{post.summary}</CardDescription>
            </CardContent>
            <CardFooter>
                <span className="text-sm text-primary font-semibold flex items-center">
                    Read More <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                </span>
            </CardFooter>
        </Card>
    </Link>
  );
}
