export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type Club = {
  id: string;
  name: string;
  logo?: string;
  description: string;
  achievements?: string[];
  bannerImage?: string;
  events?: string[];
};

export type Event = {
  id:string;
  title: string;
  date: string;
  clubId: string;
  description: string;
  location: string;
  bannerImage?: string;
  media?: string[];
};

export type Post = {
  id: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  thumbnail?: string;
  bannerImage?: string;
  content: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  mediaURL?: string;
  type: 'image' | 'video';
  clubId?: string;
  eventId?: string;
};

export type UserImage = {
  id: string;
  userId: string;
  downloadURL: string;
  fileName: string;
  fileSize: number;
  uploadedAt: { seconds: number; nanoseconds: number; };
};
