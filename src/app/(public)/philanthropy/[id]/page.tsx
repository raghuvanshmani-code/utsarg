
'use client';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Calendar, Users, HeartHandshake, Camera } from 'lucide-react';
import { format } from 'date-fns';

import { useDoc } from '@/firebase';
import type { PhilanthropyActivity } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Function to format the activity type into a readable title
function formatActivityType(type: string): string {
    if (!type) return "Philanthropic Activity";
    return type
        .split(/_|-/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


export default function PhilanthropyDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: activity, loading } = useDoc<PhilanthropyActivity>(id ? `philanthropy/${id}` : null);

  if (loading) {
    return (
        <div>
            <Skeleton className="h-[40vh] w-full" />
             <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
  }

  if (!activity) {
    notFound();
  }

  const formattedTitle = formatActivityType(activity.type);

  return (
    <div>
      <section className="relative h-[40vh] w-full flex items-center justify-center text-center text-white">
        {activity.imageUrl && (
          <Image
            src={activity.imageUrl}
            alt={`${formattedTitle} banner`}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {formattedTitle}
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-primary mb-4">About the Activity</h2>
            <p className="text-muted-foreground text-lg">{activity.description}</p>
          </div>
          
          <div className="lg:col-span-1">
             <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                      <HeartHandshake className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Details</h3>
                </div>
                <Separator />
                <ul className="space-y-4 text-muted-foreground">
                  {activity.date && !isNaN(new Date(activity.date).getTime()) && (
                    <li className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                      <div>
                        <strong>Date:</strong><br/>
                        {format(new Date(activity.date), 'EEEE, MMMM do, yyyy')}
                      </div>
                    </li>
                  )}
                  {activity.volunteers && activity.volunteers.length > 0 && (
                    <li className="flex items-start">
                      <Users className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                      <div>
                        <strong>Volunteers:</strong><br/>
                         {activity.volunteers.length} members participated
                      </div>
                    </li>
                  )}
                </ul>
             </div>
          </div>
        </div>

        {activity.photos && activity.photos.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              <Camera className="inline-block h-6 w-6 mr-2 text-primary" />
              Photo Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activity.photos.map((photoUrl, index) => (
                <div key={index} className="aspect-square relative overflow-hidden rounded-lg shadow-lg group">
                  <Image
                    src={photoUrl}
                    alt={`Photo ${index + 1} from ${formattedTitle}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
