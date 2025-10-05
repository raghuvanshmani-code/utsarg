import { PageHeader } from '@/components/page-header';
import { GalleryGrid } from '@/components/gallery-grid';

export default function GalleryPage() {
  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle="A visual journey through the vibrant life at GSVM. Explore moments from our events, clubs, and campus activities."
      />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <GalleryGrid />
      </div>
    </div>
  );
}
