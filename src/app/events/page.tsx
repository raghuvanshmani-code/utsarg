import { PageHeader } from '@/components/page-header';
import { EventsView } from '@/components/events-view';

export default function EventsPage() {
  return (
    <div>
      <PageHeader
        title="Campus Events"
        subtitle="Explore upcoming events, workshops, and competitions happening at GSVM."
      />
      <EventsView />
    </div>
  );
}
