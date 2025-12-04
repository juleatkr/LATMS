/**
 * Check Firebase Admin User
 * This script checks if the admin user exists in Firebase and displays credentials
 * 
 * Run with: npx tsx scripts/check-firebase-admin.ts
 */

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

async function checkAdminUser() {
    console.log('🔍 Checking for admin user in Firebase...\n');

    try {
        // Method 1: Query by email
        console.log('Method 1: Searching by email (admin@al-obaidani.com)...');
        const q = query(collection(db, 'users'), where('email', '==', 'admin@al-obaidani.com'));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const adminDoc = querySnapshot.docs[0];
            const adminData = adminDoc.data();

            console.log('✅ Admin user found!\n');
            console.log('📋 Admin Details:');
            console.log('   Document ID:', adminDoc.id);
            console.log('   Staff Code:', adminData.staffCode);
            console.log('   Name:', adminData.name);
            console.log('   Email:', adminData.email);
            console.log('   Password:', adminData.password);
            console.log('   Role:', adminData.role);
            console.log('   Department:', adminData.department);
            console.log('   Location:', adminData.location);
            console.log('\n🔑 Login Credentials:');
            console.log('   Email:', adminData.email);
            console.log('   Password:', adminData.password);
            console.log('\n🌐 Login URL: https://obaidani-latms.web.app/login');
            return;
        }

        // Method 2: Search for any ADMIN role users
        console.log('\n❌ Admin user not found by email.');
        console.log('Method 2: Searching for users with ADMIN role...\n');

        const adminQuery = query(collection(db, 'users'), where('role', '==', 'ADMIN'));
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
            console.log(`✅ Found ${adminSnapshot.size} admin user(s):\n`);

            adminSnapshot.forEach((doc) => {
                const data = doc.data();
                console.log('-----------------------------------');
                console.log('Document ID:', doc.id);
                console.log('Name:', data.name);
                console.log('Email:', data.email);
                console.log('Password:', data.password);
                console.log('Staff Code:', data.staffCode);
                console.log('-----------------------------------\n');
            });
            return;
        }

        // Method 3: List all users
        console.log('❌ No admin users found.');
        console.log('Method 3: Listing all users in database...\n');

        const allUsersSnapshot = await getDocs(collection(db, 'users'));

        if (allUsersSnapshot.empty) {
            console.log('⚠️  No users found in the database!');
            console.log('The database appears to be empty.');
            return;
        }

        console.log(`📊 Found ${allUsersSnapshot.size} total users:\n`);

        allUsersSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('-----------------------------------');
            console.log('ID:', doc.id);
            console.log('Name:', data.name || 'N/A');
            console.log('Email:', data.email || 'N/A');
            console.log('Role:', data.role || 'N/A');
            console.log('Password:', data.password || 'N/A');
            console.log('-----------------------------------\n');
        });

    } catch (error) {
        console.error('❌ Error checking admin user:', error);
        throw error;
    }
}

async function main() {
    try {
        await checkAdminUser();
        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

main();
