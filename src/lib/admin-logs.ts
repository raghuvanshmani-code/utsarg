
'use server';

import { addDoc, collection, Firestore, serverTimestamp } from "firebase/firestore";

type AdminLogPayload = {
    username: string;
    action: 'create' | 'update' | 'delete' | 'json-batch-import';
    collection: string;
    docId?: string;
    details: string;
};

export const createAdminLog = async (db: Firestore, payload: AdminLogPayload) => {
    try {
        const logCollectionRef = collection(db, 'admin_logs');
        await addDoc(logCollectionRef, {
            ...payload,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Failed to create admin log:", error);
        // Optionally, re-throw or handle the error as needed
    }
};
