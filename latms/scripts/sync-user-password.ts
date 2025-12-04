/**
 * Sync User Password from Firestore to Firebase Auth
 * This updates Firebase Auth password to match the Firestore password
 * 
 * Run with: npx tsx scripts/sync-user-password.ts
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { adminAuth } from '../src/lib/firebase-admin';

const USER_EMAIL = 'sudhan@al-obaidani.com';

async function syncUserPassword() {
    console.log('🔄 Syncing password for user:', USER_EMAIL);
    console.log('='.repeat(60));

    try {
        // Step 1: Get user from Firestore
        console.log('\n📦 Step 1: Fetching user from Firestore...');
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', USER_EMAIL));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('❌ User not found in Firestore');
            return;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        console.log('✅ User found in Firestore');
        console.log('   Document ID:', userId);
        console.log('   Email:', userData.email);
        console.log('   Has password:', !!userData.password);

        if (!userData.password) {
            console.log('\n⚠️  No password found in Firestore');
            console.log('   Cannot sync password. Please set a password manually.');
            return;
        }

        // Step 2: Check Firebase Auth
        console.log('\n🔐 Step 2: Checking Firebase Auth...');
        try {
            const authUser = await adminAuth.getUser(userId);
            console.log('✅ User exists in Firebase Auth');
            console.log('   UID:', authUser.uid);
            console.log('   Email:', authUser.email);

            // Step 3: Update password
            console.log('\n🔄 Step 3: Updating Firebase Auth password...');
            await adminAuth.updateUser(userId, {
                password: userData.password
            });

            console.log('✅ Password updated successfully!');
            console.log('\n📋 Next Steps:');
            console.log('   1. Tell user to log out');
            console.log('   2. Tell user to log back in with their existing password');
            console.log('   3. User should now authenticate with Firebase Auth');
            console.log('   4. User should be able to create tickets');

        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log('❌ User not found in Firebase Auth');
                console.log('\n🔧 Creating user in Firebase Auth...');

                await adminAuth.createUser({
                    uid: userId,
                    email: userData.email,
                    password: userData.password,
                    displayName: userData.name,
                    disabled: false,
                });

                console.log('✅ User created in Firebase Auth!');
                console.log('\n📋 Next Steps:');
                console.log('   1. Tell user to log out');
                console.log('   2. Tell user to log back in');
                console.log('   3. User should now authenticate with Firebase Auth');
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
        throw error;
    }
}

async function main() {
    try {
        await syncUserPassword();
        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

main();
