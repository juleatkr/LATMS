/**
 * Simple User Lookup in Firestore
 * This checks if user exists in Firestore (doesn't require Firebase Admin)
 * 
 * Run with: npx tsx scripts/check-firestore-user.ts
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

const USER_EMAIL = 'sudhan@al-obaidani.com';

async function checkFirestoreUser() {
    console.log('🔍 Checking Firestore for user:', USER_EMAIL);
    console.log('='.repeat(60));

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
        const userId = userDoc.id;

        console.log('\n✅ User found in Firestore:');
        console.log('   Document ID:', userId);
        console.log('   Name:', userData.name || 'N/A');
        console.log('   Email:', userData.email);
        console.log('   Role:', userData.role || 'N/A');
        console.log('   Department:', userData.department || 'N/A');
        console.log('   Staff Code:', userData.staffCode || 'N/A');
        console.log('   Has Legacy Password:', !!userData.password);

        console.log('\n📋 Next Steps:');
        console.log('   1. Check if this user exists in Firebase Authentication');
        console.log('   2. Go to: https://console.firebase.google.com/');
        console.log('   3. Select project: obaidani-latms');
        console.log('   4. Navigate to: Authentication → Users');
        console.log('   5. Search for UID:', userId);
        console.log('');
        console.log('   ✅ If user EXISTS in Firebase Auth:');
        console.log('      - User should be able to create tickets');
        console.log('      - Check if they are logged in properly');
        console.log('');
        console.log('   ❌ If user DOES NOT EXIST in Firebase Auth:');
        console.log('      - Run: npx tsx scripts/migrate-users-to-auth.ts');
        console.log('      - Or create user manually in Firebase Console');

        if (userData.password) {
            console.log('\n⚠️  WARNING: User has legacy password field');
            console.log('   This user might be logging in with fallback authentication');
            console.log('   They need to be migrated to Firebase Auth');
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
        throw error;
    }
}

async function main() {
    try {
        await checkFirestoreUser();
        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

main();
