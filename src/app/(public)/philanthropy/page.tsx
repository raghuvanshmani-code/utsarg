
'use client';
import { PageHeader } from '@/components/page-header';
import { useCollection } from '@/firebase';
import type { PhilanthropyActivity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { HeartHandshake, Users } from 'lucide-react';
import Image from 'next/image';

function PhilanthropySkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    );
}

export default function PhilanthropyPage() {
    const { data: activities, loading } = useCollection<PhilanthropyActivity>('philanthropy');

    return (
        <div>
            <PageHeader
                title="Philanthropic Activities"
                subtitle="Giving back to the community is at the heart of what we do."
            />
            <div className="container mx-auto px-4 py-12 md:py-16">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <PhilanthropySkeleton />
                        <PhilanthropySkeleton />
                        <PhilanthropySkeleton />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activities.map((activity) => (
                            <Card key={activity.id}>
                                {activity.imageUrl && (
                                     <div className="aspect-video relative overflow-hidden rounded-t-lg">
                                        <Image src={activity.imageUrl} alt={activity.type} fill className="object-cover" />
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full">
                                            <HeartHandshake className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>{activity.type}</CardTitle>
                                            {activity.date && !isNaN(new Date(activity.date).getTime()) ? (
                                                <p className="text-sm text-muted-foreground">{format(new Date(activity.date), 'MMMM dd, yyyy')}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-4">{activity.description}</p>
                                    
                                    {activity.volunteers && activity.volunteers.length > 0 && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Users className="h-4 w-4 mr-2" />
                                            <span>{activity.volunteers.length} volunteers participated</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
