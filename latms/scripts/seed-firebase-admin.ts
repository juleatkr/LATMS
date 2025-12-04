/**
 * Seed Firebase with Admin User
 * This script creates the initial admin user in Firebase Firestore
 * 
 * Run with: npx tsx scripts/seed-firebase-admin.ts
 */

import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

async function seedAdmin() {
    console.log('🚀 Seeding Firebase with admin user...\n');

    const adminData = {
        staffCode: 'HR:001',
        email: 'admin@al-obaidani.com',
        name: 'HR Admin',
        password: 'admin123', // Note: In production, this should be hashed
        role: 'ADMIN',
        department: 'HR',
        location: 'HO',
        ticketEligible: true,
        annualLeaveBal: 30,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };

    try {
        // Check if admin already exists
        const adminRef = doc(db, 'users', 'admin-001');
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
            console.log('⚠️  Admin user already exists. Updating...');
        } else {
            console.log('✨ Creating new admin user...');
        }

        await setDoc(adminRef, adminData);

        console.log('✅ Admin user seeded successfully!');
        console.log('\n📋 Admin Credentials:');
        console.log('   Email: admin@al-obaidani.com');
        console.log('   Password: admin123');
        console.log('\n🌐 Login at: https://obaidani-latms.web.app/login');

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        throw error;
    }
}

// Also seed some test users
async function seedTestUsers() {
    console.log('\n🔄 Seeding test users...\n');

    const users = [
        {
            id: 'supervisor-001',
            staffCode: 'SUP:001',
            email: 'supervisor@al-obaidani.com',
            name: 'Ahmed Al-Balushi',
            password: 'supervisor123',
            role: 'SUPERVISOR',
            department: 'Sales',
            location: 'Muscat Branch',
            annualLeaveBal: 30,
            ticketEligible: true,
        },
        {
            id: 'employee-001',
            staffCode: 'EC:6143',
            email: 'employee@al-obaidani.com',
            name: 'Jay Kay',
            password: 'user123',
            role: 'EMPLOYEE',
            department: 'Sales',
            location: 'Muscat Branch',
            annualLeaveBal: 24,
            ticketEligible: true,
            supervisorId: 'supervisor-001',
        },
        {
            id: 'hr-001',
            staffCode: 'HR:002',
            email: 'hr@al-obaidani.com',
            name: 'HR Manager',
            password: 'hr123',
            role: 'HR',
            department: 'HR',
            location: 'HO',
            annualLeaveBal: 30,
            ticketEligible: true,
        }
    ];

    for (const userData of users) {
        const { id, ...data } = userData;
        const userRef = doc(db, 'users', id);

        await setDoc(userRef, {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        console.log(`✅ Created ${data.role}: ${data.email}`);
    }
}

async function main() {
    try {
        await seedAdmin();
        await seedTestUsers();
        console.log('\n🎉 All users seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();
