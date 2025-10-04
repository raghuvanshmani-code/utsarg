import { PageHeader } from '@/components/page-header';
import { ClubCard } from '@/components/club-card';
import { clubs } from '@/lib/data';

export default function ClubsPage() {
  return (
    <div>
      <PageHeader
        title="Our Clubs"
        subtitle="Find your community. Explore the diverse range of clubs and activities at GSVM."
      />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {clubs.map((club) => (
            <ClubCard key={club.slug} club={club} />
          ))}
        </div>
      </div>
    </div>
  );
}
