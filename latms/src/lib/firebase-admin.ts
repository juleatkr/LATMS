/**
 * Firebase Admin SDK Setup
 * Used for server-side operations like creating users in Firebase Auth
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    // For local development and production
    admin.initializeApp({
        projectId: 'obaidani-latms',
    });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

export default admin;
