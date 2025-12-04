/**
 * Migrate Existing Users to Firebase Auth
 * This script creates Firebase Auth accounts for all existing users in Firestore
 * 
 * Run with: npx tsx scripts/migrate-users-to-auth.ts
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { adminAuth } from '../src/lib/firebase-admin';

async function migrateUsersToAuth() {
    console.log('🚀 Starting migration of users to Firebase Auth...\n');

    try {
        // Fetch all users from Firestore
        const usersSnapshot = await getDocs(collection(db, 'users'));

        if (usersSnapshot.empty) {
            console.log('⚠️  No users found in Firestore');
            return;
        }

        console.log(`📊 Found ${usersSnapshot.size} users to migrate\n`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const userId = userDoc.id;

            console.log(`\nProcessing: ${userData.name} (${userData.email})`);

            try {
                // Check if user already exists in Firebase Auth
                try {
                    await adminAuth.getUser(userId);
                    console.log(`  ⏭️  Already exists in Firebase Auth - skipping`);
                    skipCount++;
                    continue;
                } catch (error: any) {
                    if (error.code !== 'auth/user-not-found') {
                        throw error;
                    }
                    // User doesn't exist, proceed with creation
                }

                // Create Firebase Auth user
                const password = userData.password || 'ChangeMe123!'; // Default password if none exists

                await adminAuth.createUser({
                    uid: userId, // Use the same ID from Firestore
                    email: userData.email,
                    password: password,
                    displayName: userData.name,
                    disabled: false,
                });

                console.log(`  ✅ Created in Firebase Auth`);
                successCount++;

            } catch (error: any) {
                console.error(`  ❌ Error:`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 Migration Summary:');
        console.log(`  ✅ Successfully created: ${successCount}`);
        console.log(`  ⏭️  Skipped (already exist): ${skipCount}`);
        console.log(`  ❌ Errors: ${errorCount}`);
        console.log('='.repeat(50));

        if (errorCount === 0) {
            console.log('\n🎉 Migration completed successfully!');
        } else {
            console.log('\n⚠️  Migration completed with some errors');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

async function main() {
    try {
        await migrateUsersToAuth();
        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

main();
