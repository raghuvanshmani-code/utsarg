import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Post } from '@/lib/types';
import { format } from 'date-fns';

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  
  return (
    <Link href={`/blog/${post.id}`} className="group block h-full">
        <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:border-accent hover:-translate-y-1">
            {post.thumbnail && (
            <div className="aspect-video relative overflow-hidden">
                <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            )}
            <CardHeader>
                <div className="text-xs text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center"><User className="h-3 w-3 mr-1.5" /> {post.author}</span>
                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1.5" /> {format(new Date(post.date), 'MMM dd, yyyy')}</span>
                </div>
                <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <CardDescription>{post.summary}</CardDescription>
            </CardContent>
            <CardFooter>
                <span className="text-sm text-accent font-semibold flex items-center">
                    Read More <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                </span>
            </CardFooter>
        </Card>
    </Link>
  );
}
