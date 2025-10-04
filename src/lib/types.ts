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
};

export type Post = {
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
};
