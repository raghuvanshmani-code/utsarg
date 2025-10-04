import type { Club, Event, Post, GalleryImage } from './types';

// NOTE: This file is now deprecated. Data is being fetched from Firestore.
// The data is kept here for reference during the transition.

export const clubs: Club[] = [
  {
    id: 'music-club',
    name: 'Music Club',
    description: 'Fostering musical talent and organizing melodious events. From classical to rock, all genres are welcome.',
    logo: 'music-club-logo',
    events: ['annual-fest-2024'],
    bannerImage: 'club-banner-music',
    achievements: [
        'Winners of Inter-College Battle of Bands 2023',
        'Organized "Symphony"- the annual musical night',
        'Hosted workshops with renowned artists',
    ],
  },
  {
    id: 'literary-club',
    name: 'Literary Club',
    description: 'A hub for writers, poets, and orators. We celebrate the power of words through debates, slams, and publications.',
    logo: 'literary-club-logo',
    events: ['poetry-slam-2024'],
    bannerImage: 'club-banner-literary',
    achievements: [
        'Published annual college magazine "Canvas"',
        'National Debate Champions 2023',
        'Organized LitFest with celebrated authors',
    ],
  },
  { 
    id: 'sports-club',
    name: 'Sports Club',
    description: 'Promoting physical fitness and sportsmanship. We manage teams for cricket, football, basketball, and more.',
    logo: 'sports-club-logo',
    events: ['sports-day-2024'],
    bannerImage: 'club-banner-sports',
    achievements: [
        'University Football Champions 2022',
        'Hosted the Annual Sports Day successfully',
        'Sent teams to over 10 national competitions',
    ],
  },
  {
    id: 'art-club',
    name: 'Art Club',
    logo: 'art-club-logo',
    description: 'A space for creativity to flourish. Join us for painting, sculpture, and digital art workshops and exhibitions.',
    bannerImage: 'club-banner-art',
    achievements: [
        'Annual Art Exhibition visited by 1000+ people',
        'Campus beautification project completion',
        'Won "Best Stall" at the University Fair',
    ],
  },
  {
    id: 'tech-club',
    name: 'Tech Club',
    logo: 'tech-club-logo',
    description: 'Exploring the world of technology, from coding to robotics. We host hackathons, workshops, and tech talks.',
    events: ['hackathon-2024'],
    bannerImage: 'club-banner-tech',
    achievements: [
        'Winners of Smart India Hackathon 2023',
        'Developed the official college app',
        'Conducted 20+ workshops on new technologies',
    ],
  },
    {
    id: 'social-club',
    name: 'Social Service Club',
    logo: 'social-club-logo',
    description: 'Dedicated to making a positive impact in the community through volunteering and social awareness campaigns.',
    bannerImage: 'club-banner-social',
    achievements: [
        'Organized blood donation camp with 500+ donors',
        'Led a successful city-wide cleanliness drive',
        'Partnered with local NGOs for child education programs',
    ],
    },
];

export const events: Event[] = [
  {
    id: 'annual-fest-2024',
    title: 'Vibrations 2024 - Annual Fest',
    date: '2024-10-20T18:00:00Z',
    clubId: 'music-club',
    location: 'College Auditorium',
    description: 'The most awaited event of the year! A 3-day extravaganza of music, dance, and culture. Featuring live performances, competitions, and celebrity guests.',
    bannerImage: 'event-annual-fest',
    media: ['gallery-1', 'gallery-7']
  },
  {
    id: 'sports-day-2024',
    title: 'Annual Sports Day',
    date: '2024-11-15T09:00:00Z',
    clubId: 'sports-club',
    location: 'College Sports Complex',
    description: 'A day of thrilling athletic competitions. Witness students compete in track and field, team sports, and more to win glory for their batches.',
    bannerImage: 'event-sports-day',
    media: ['gallery-2', 'gallery-8']
  },
  {
    id: 'hackathon-2024',
    title: 'Innovate & Create Hackathon',
    date: '2024-11-30T10:00:00Z',
    clubId: 'tech-club',
    location: 'Digital Library',
    description: 'A 24-hour coding marathon where teams build innovative solutions to real-world problems. Exciting prizes and internship opportunities to be won.',
    bannerImage: 'event-hackathon',
    media: ['gallery-4', 'gallery-6']
  },
    {
    id: 'poetry-slam-2024',
    title: 'Poetry Slam Night',
    date: '2024-09-25T19:00:00Z',
    clubId: 'literary-club',
    location: 'Amphitheater',
    description: 'An evening of powerful spoken word performances. Come and share your poetry or just listen to the incredible talent of our students.',
    bannerImage: 'blog-event-recap',
    media: ['gallery-5']
    },
];

export const posts: Post[] = [
  {
    id: 'new-student-committee-elected',
    title: 'New Student Committee Elected for 2024-25',
    summary: 'The results are in! Meet the new faces of the UTSARG student committee who will be leading the charge for the upcoming academic year.',
    author: 'Admin',
    date: '2024-08-01T12:00:00Z',
    thumbnail: 'blog-new-committee',
    bannerImage: 'blog-new-committee',
    content: '<p>The votes have been tallied, and we are thrilled to announce the new UTSARG Student Committee for the academic year 2024-25. This dedicated group of students will be at the forefront of all student activities, working to make this year the most memorable one yet. The new committee is a diverse group, with representatives from various batches and a shared passion for enhancing student life on campus.</p><p>We extend our heartfelt congratulations to the newly elected members and thank all the candidates who participated. The handover ceremony will take place next week, and the new committee will officially begin their duties then. Stay tuned for their introductory messages and plans for the year!</p>',
  },
  {
    id: 'vibrations-2023-a-recap',
    title: 'Vibrations 2023: A Grand Success!',
    summary: 'Relive the best moments from our annual fest, Vibrations 2023. From the electrifying concerts to the stunning cultural performances, it was a week to remember.',
    author: 'Art Club',
    date: '2023-10-25T12:00:00Z',
    thumbnail: 'blog-event-recap',
    bannerImage: 'event-annual-fest',
    content: '<p>Vibrations 2023 has concluded, and what a spectacular event it was! The campus was buzzing with energy for three straight days, with students showcasing their talents and enjoying the myriad of events. The battle of the bands was a major highlight, with fierce competition and incredible performances. The celebrity night featuring a surprise guest artist left everyone spellbound.</p><p>We thank the organizing committee, volunteers, and all participants for making this event a grand success. The memories we made will be cherished for a long time. Check out the gallery for photos from the event!</p>',
  },
    {
    id: 'tech-club-wins-hackathon',
    title: 'Tech Club Dominates at National Hackathon',
    summary: 'Our very own Tech Club has brought home the first prize from the prestigious Smart India Hackathon 2023, beating hundreds of teams from across the country.',
    author: 'Tech Club',
    date: '2023-09-10T12:00:00Z',
    thumbnail: 'event-hackathon',
    bannerImage: 'event-hackathon',
    content: '<p>In a remarkable achievement, the GSVM Tech Club has secured the top position at the Smart India Hackathon 2023. Their project, an AI-powered diagnostic tool for rural healthcare, was lauded by the judges for its innovation and social impact. The team worked tirelessly for 36 hours to develop the prototype that won them this coveted award.</p><p>This victory is a testament to the talent and hard work of our students and the supportive ecosystem provided by the college. The Tech Club will be holding a session next week to share their experience and showcase their winning project. We encourage everyone to attend and get inspired.</p>',
    },
];

export const galleryImages: GalleryImage[] = [
    { id: 'gallery-1', title: 'Cultural Night Performance', mediaURL: 'gallery-1', type: 'image', eventId: 'annual-fest-2024', clubId: 'music-club' },
    { id: 'gallery-2', title: 'Championship Victory', mediaURL: 'gallery-2', type: 'image', eventId: 'sports-day-2024', clubId: 'sports-club' },
    { id: 'gallery-3', title: 'Art Exhibition', mediaURL: 'gallery-3', type: 'image', clubId: 'art-club' },
    { id: 'gallery-4', title: 'Robotics Workshop', mediaURL: 'gallery-4', type: 'image', eventId: 'hackathon-2024', clubId: 'tech-club'},
    { id: 'gallery-5', title: 'Poetry Slam', mediaURL: 'gallery-5', type: 'image', eventId: 'poetry-slam-2024', clubId: 'literary-club' },
    { id: 'gallery-6', title: 'Project Demo', mediaURL: 'gallery-6', type: 'image', clubId: 'tech-club'},
    { id: 'gallery-7', title: 'Annual Fest Crowd', mediaURL: 'event-annual-fest', type: 'image', eventId: 'annual-fest-2024', clubId: 'music-club' },
    { id: 'gallery-8', title: 'Runners at the starting line', mediaURL: 'event-sports-day', type: 'image', eventId: 'sports-day-2024', clubId: 'sports-club' },
];
