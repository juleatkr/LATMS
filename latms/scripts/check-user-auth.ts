/**
 * Check Firebase Auth Status for Specific User
 * This script checks if a user exists in both Firestore and Firebase Auth
 * 
 * Run with: npx tsx scripts/check-user-auth.ts
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { adminAuth } from '../src/lib/firebase-admin';

const USER_EMAIL = 'sudhan@al-obaidani.com';

async function checkUserAuth() {
    console.log('🔍 Checking Firebase Auth status for:', USER_EMAIL);
    console.log('='.repeat(60));

    try {
        // Step 1: Check Firestore
        console.log('\n📦 Step 1: Checking Firestore...');
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', USER_EMAIL));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('❌ User NOT found in Firestore');
            return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        console.log('✅ User found in Firestore:');
        console.log('   - Document ID:', userId);
        console.log('   - Name:', userData.name);
        console.log('   - Email:', userData.email);
        console.log('   - Role:', userData.role);
        console.log('   - Department:', userData.department);
        console.log('   - Has Password:', !!userData.password);

        // Step 2: Check Firebase Auth
        console.log('\n🔐 Step 2: Checking Firebase Authentication...');
        try {
            const authUser = await adminAuth.getUser(userId);
            console.log('✅ User EXISTS in Firebase Auth:');
            console.log('   - UID:', authUser.uid);
            console.log('   - Email:', authUser.email);
            console.log('   - Email Verified:', authUser.emailVerified);
            console.log('   - Disabled:', authUser.disabled);
            console.log('   - Created:', authUser.metadata.creationTime);
            console.log('   - Last Sign In:', authUser.metadata.lastSignInTime);

            console.log('\n✅ DIAGNOSIS: User is properly set up!');
            console.log('   The user should be able to create tickets.');
            console.log('   If they still cannot, check:');
            console.log('   1. Are they logged in with Firebase Auth (not legacy)?');
            console.log('   2. Check browser console for auth errors');
            console.log('   3. Verify Firestore rules are deployed');

        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log('❌ User NOT found in Firebase Auth');
                console.log('\n🔧 DIAGNOSIS: User needs to be migrated!');
                console.log('   This user exists in Firestore but not in Firebase Auth.');
                console.log('   They are logging in with legacy password authentication.');
                console.log('   Firestore security rules require Firebase Auth.');
                console.log('\n💡 SOLUTION:');
                console.log('   Run: npx tsx scripts/migrate-users-to-auth.ts');
                console.log('   Or create this specific user manually in Firebase Console');
            } else {
                throw error;
            }
        }

        // Step 3: Check if user can authenticate
        console.log('\n🔑 Step 3: Authentication Method Check...');
        if (userData.password) {
            console.log('⚠️  User has legacy password in Firestore');
            console.log('   This means they might be using fallback auth');
        }

    } catch (error) {
        console.error('❌ Error during check:', error);
        throw error;
    }
}

async function main() {
    try {
        await checkUserAuth();
        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

main();
