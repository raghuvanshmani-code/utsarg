
'use client';
import { PageHeader } from '@/components/page-header';
import { useCollection } from '@/firebase';
import type { PhilanthropyActivity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { HeartHandshake, Calendar, ArrowRight, Users, Gift } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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
    if (!type) return "Philanthropic Activity";
    return type
        .split(/_|-/)
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
            <div className="container mx-auto px-4 py-12 md:py-16 space-y-12">
                
                <Card className="bg-card text-center" data-scroll>
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            <Gift className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Support Our Cause</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            Your generous donations help us fund our philanthropic activities, from organizing health camps to supporting local communities. Every contribution, big or small, makes a significant impact.
                        </p>
                        <Button size="lg" variant="accent" className="transform transition-transform hover:scale-105 rounded-full w-full max-w-xs mx-auto">
                                Donate Now
                        </Button>
                    </CardContent>
                </Card>

                <div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <PhilanthropySkeleton />
                            <PhilanthropySkeleton />
                            <PhilanthropySkeleton />
                        </div>
                    ) : (
                        <Carousel 
                            opts={{ align: "start" }}
                            className="w-full"
                        >
                            <CarouselContent>
                                {activities.map((activity) => (
                                    <CarouselItem key={activity.id} className="md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1 h-full">
                                            <Link href={`/philanthropy/${activity.id}`} className="group block h-full">
                                                <Card className="flex flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:border-accent hover:-translate-y-1 h-full">
                                                    {activity.imageUrl && (
                                                        <div className="aspect-video relative overflow-hidden">
                                                            <Image src={activity.imageUrl} alt={activity.type} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                                        </div>

                                                    )}
                                                    <CardHeader>
                                                        <div className="flex items-start gap-4">
                                                            <div className="bg-primary/10 p-3 rounded-full mt-1">
                                                                <HeartHandshake className="h-6 w-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <CardTitle>{formatActivityType(activity.type)}</CardTitle>
                                                                {activity.date && !isNaN(new Date(activity.date).getTime()) && (
                                                                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                                                                        <Calendar className="h-4 w-4 mr-2" />
                                                                        <span>{format(new Date(activity.date), 'MMMM dd, yyyy')}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="flex-grow">
                                                        <p className="text-sm text-muted-foreground line-clamp-3">{activity.description}</p>
                                                    </CardContent>
                                                    <CardFooter className="flex justify-between items-center">
                                                        {activity.volunteers && activity.volunteers.length > 0 && (
                                                            <div className="flex items-center text-sm text-muted-foreground">
                                                                <Users className="h-4 w-4 mr-2" />
                                                                <span>{activity.volunteers.length} Volunteers</span>
                                                            </div>
                                                        )}
                                                        <span className="text-sm text-accent font-semibold flex items-center ml-auto">
                                                            Learn More <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                                                        </span>
                                                    </CardFooter>
                                                </Card>
                                            </Link>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:inline-flex" />
                            <CarouselNext className="hidden md:inline-flex" />
                        </Carousel>
                    )}
                </div>
            </div>
        </div>
    );
}
