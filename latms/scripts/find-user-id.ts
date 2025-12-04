/**
 * Find User Document ID in Firestore
 * This finds the Firestore document ID for a specific user email
 * 
 * Run with: npx tsx scripts/find-user-id.ts
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

const USER_EMAIL = '4150@al-obaidani.com';
// const FIREBASE_AUTH_UID = 'TSN9e9nTMkdl3gexT7sPT7rRFvE3'; // Commented out as we don't know it yet

async function findUserId() {
    console.log('🔍 Finding Firestore document for:', USER_EMAIL);
    console.log('='.repeat(70));

    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', USER_EMAIL));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('\n❌ User NOT found in Firestore');
            console.log('   This user does not exist in the database.');
            return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const firestoreDocId = userDoc.id;

        console.log('\n✅ User found in Firestore!');
        console.log('='.repeat(70));
        console.log('\n📋 DOCUMENT DETAILS:');
        console.log('   Firestore Document ID:', firestoreDocId);
        console.log('   Email:', userData.email);
        console.log('   Name:', userData.name || 'N/A');
        console.log('   Role:', userData.role || 'N/A');
        console.log('   Department:', userData.department || 'N/A');
        console.log('   Staff Code:', userData.staffCode || 'N/A');

        console.log('\n🔑 ID COMPARISON:');
        console.log('   Firestore Document ID:', firestoreDocId);

        // Check if we can find this user in Auth using Admin SDK
        try {
            const { adminAuth } = await import('../src/lib/firebase-admin');
            try {
                const authUser = await adminAuth.getUserByEmail(USER_EMAIL);
                console.log('   Firebase Auth UID:    ', authUser.uid);

                if (firestoreDocId === authUser.uid) {
                    console.log('\n✅ ✅ ✅ IDs MATCH! ✅ ✅ ✅');
                } else {
                    console.log('\n❌ ❌ ❌ IDs DO NOT MATCH! ❌ ❌ ❌');
                    console.log('   Firestore ID:', firestoreDocId);
                    console.log('   Auth UID:    ', authUser.uid);
                }
            } catch (e: any) {
                if (e.code === 'auth/user-not-found') {
                    console.log('❌ User NOT found in Firebase Auth');
                } else {
                    console.error('Error checking Auth:', e);
                }
            }
        } catch (e) {
            console.log('⚠️ Could not check Firebase Auth (Admin SDK not initialized or available)');
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
        throw error;
    }
}

async function main() {
    try {
        await findUserId();
        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

main();
