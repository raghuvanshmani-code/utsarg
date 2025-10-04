'use client';
import { PageHeader } from '@/components/page-header';
import { ClubCard } from '@/components/club-card';
import { useCollection } from '@/firebase';
import type { Club } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function ClubCardSkeleton() {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
}

export default function ClubsPage() {
  const { data: clubs, loading } = useCollection<Club>('clubs');
  return (
    <div>
      <PageHeader
        title="Our Clubs"
        subtitle="Find your community. Explore the diverse range of clubs and activities at GSVM."
      />
      <div className="container mx-auto px-4 py-12 md:py-16">
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <ClubCardSkeleton />
                <ClubCardSkeleton />
                <ClubCardSkeleton />
                <ClubCardSkeleton />
                <ClubCardSkeleton />
                <ClubCardSkeleton />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
            ))}
            </div>
        )}
      </div>
    </div>
  );
}
