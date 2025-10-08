
'use client';
import { PageHeader } from '@/components/page-header';
import { useCollection } from '@/firebase';
import type { PhilanthropyActivity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { HeartHandshake, Users, Calendar } from 'lucide-react';
import Image from 'next/image';

function PhilanthropySkeleton() {
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

// Function to format the activity type into a readable title
function formatActivityType(type: string): string {
    return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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
                            <Card key={activity.id} className="flex flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:border-accent hover:-translate-y-1">
                                {activity.imageUrl && (
                                     <div className="aspect-video relative overflow-hidden">
                                        <Image src={activity.imageUrl} alt={activity.type} fill className="object-cover" />
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full mt-1">
                                            <HeartHandshake className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>{formatActivityType(activity.type)}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-end">
                                    <div className="space-y-2 text-sm text-muted-foreground mt-4">
                                        {activity.date && !isNaN(new Date(activity.date).getTime()) && (
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                <span>{format(new Date(activity.date), 'MMMM dd, yyyy')}</span>
                                            </div>
                                        )}
                                        {activity.volunteers && activity.volunteers.length > 0 && (
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-2" />
                                                <span>{activity.volunteers.length} volunteers participated</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
