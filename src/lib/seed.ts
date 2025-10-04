'use client';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { clubs, events, posts, galleryImages } from './data';
import { Firestore } from 'firebase/firestore';

export async function seedDatabase(db: Firestore) {
    if (!db) {
        throw new Error("Firestore instance is not available.");
    }
    
    const batch = writeBatch(db);

    // Seed Clubs
    const clubsCollection = collection(db, 'clubs');
    clubs.forEach(club => {
        const docRef = doc(clubsCollection, club.id);
        batch.set(docRef, club);
    });

    // Seed Events
    const eventsCollection = collection(db, 'events');
    events.forEach(event => {
        const docRef = doc(eventsCollection, event.id);
        batch.set(docRef, event);
    });

    // Seed Blog Posts
    const blogCollection = collection(db, 'blog');
    posts.forEach(post => {
        const docRef = doc(blogCollection, post.id);
        batch.set(docRef, post);
    });

    // Seed Gallery Images
    const galleryCollection = collection(db, 'gallery');
    galleryImages.forEach(image => {
        const docRef = doc(galleryCollection, image.id);
        batch.set(docRef, image);
    });

    try {
        await batch.commit();
        console.log('Database seeded successfully!');
        return { success: true, message: 'Database seeded successfully!' };
    } catch (error) {
        console.error('Error seeding database: ', error);
        return { success: false, message: `Error seeding database: ${error}` };
    }
}
