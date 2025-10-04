export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type Club = {
  slug: string;
  name: string;
  logo: string;
  description: string;
  achievements?: string[];
  bannerImage: string;
  events?: string[];
};

export type Event = {
  id: string;
  title: string;
  date: string;
  club: string;
  clubSlug: string;
  description: string;
  location: string;
  bannerImage: string;
  media?: string[];
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  thumbnail: string;
  bannerImage: string;
  content: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  imageId: string;
  type: 'image' | 'video';
  clubId?: string;
  eventId?: string;
};
