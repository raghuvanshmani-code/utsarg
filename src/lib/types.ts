export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type Club = {
  id: string;
  name: string;
  logo?: string;
  bannerImage?: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  genres?: string[];
  core_volunteers?: string[];
  volunteer_list?: string[];
  sequence_events?: string[];
  requirements?: object;
  budget?: object;
  gallery?: string[];
  tags?: string[];
  members_count?: number;
  achievements?: string[];
  created_at?: any;
  updated_at?: any;
};

export type Event = {
  id:string;
  clubId: string;
  title: string;
  date: string;
  location: string;
  description: string;
  budget?: number;
  gallery?: string[];
  bannerImage?: string;
  created_at?: any;
  venue: string; // From entity, keeping for compatibility if used elsewhere
  status: 'planned' | 'complete'; // From entity
};

export type Post = {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  created_by?: string;
  created_at?: any;
  summary: string;
  author: string;
  date: string;
  thumbnail?: string;
  bannerImage?: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  caption?: string;
  tags?: string[];
  uploadedBy?: string;
  date?: string;
};

export type UserImage = {
  id: string;
  userId: string;
  downloadURL: string;
  fileName: string;
  fileSize: number;
  uploadedAt: { seconds: number; nanoseconds: number; };
};

export type PhilanthropyActivity = {
    id: string;
    type: string;
    description: string;
    date: string;
    volunteers: string[];
    photos: string[];
};

export type FundTransaction = {
    id: string;
    amount: number;
    source: string;
    purpose: string;
    date: string;
    signatories: string[];
};
