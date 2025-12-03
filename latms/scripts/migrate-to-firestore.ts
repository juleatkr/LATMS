/**
 * SQLite to Firebase Firestore Migration Script
 * 
 * This script migrates all data from your SQLite database to Firebase Firestore
 * Run this with: npx tsx scripts/migrate-to-firestore.ts
 */

import { PrismaClient } from '@prisma/client';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';

const prisma = new PrismaClient();

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQNpmvJcFpiEFm8Elag3oz5BW66q_TWLU",
    authDomain: "obaidani-latms.firebaseapp.com",
    projectId: "obaidani-latms",
    storageBucket: "obaidani-latms.firebasestorage.app",
    messagingSenderId: "958600713226",
    appId: "1:958600713226:web:04e96ab438da494ac9fbf3",
    measurementId: "G-GKZHVY1D5K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUsers() {
    console.log('\n📦 Migrating Users...');

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to migrate`);

    let batch = writeBatch(db);
    let count = 0;
    let batchCount = 0;

    for (const user of users) {
        const userRef = doc(db, 'users', user.id);

        batch.set(userRef, {
            staffCode: user.staffCode,
            email: user.email,
            password: user.password, // Note: In production, you'd want to re-hash these
            name: user.name,
            role: user.role,
            department: user.department || null,
            position: user.position || null,
            location: user.location || null,
            annualLeaveBal: user.annualLeaveBal,
            ticketEligible: user.ticketEligible,
            supervisorId: user.supervisorId || null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });

        count++;
        batchCount++;

        // Firestore batch limit is 500 operations
        if (batchCount === 500) {
            await batch.commit();
            console.log(`  ✓ Committed batch of ${batchCount} users`);
            batch = writeBatch(db);
            batchCount = 0;
        }
    }

    // Commit remaining
    if (batchCount > 0) {
        await batch.commit();
        console.log(`  ✓ Committed final batch of ${batchCount} users`);
    }

    console.log(`✅ Migrated ${count} users successfully!`);
}

async function migrateLeaveRequests() {
    console.log('\n📦 Migrating Leave Requests...');

    const leaveRequests = await prisma.leaveRequest.findMany({
        include: {
            user: true,
            submittedBy: true
        }
    });

    console.log(`Found ${leaveRequests.length} leave requests to migrate`);

    let batch = writeBatch(db);
    let count = 0;
    let batchCount = 0;

    for (const request of leaveRequests) {
        const requestRef = doc(db, 'leaveRequests', request.id);

        batch.set(requestRef, {
            userId: request.userId,
            submittedById: request.submittedById || null,
            type: request.type,
            startDate: request.startDate,
            endDate: request.endDate,
            days: request.days,
            status: request.status,
            reason: request.reason || null,

            // Approval tracking
            managerApprovedBy: request.managerApprovedBy || null,
            managerApprovedAt: request.managerApprovedAt || null,
            hrApprovedBy: request.hrApprovedBy || null,
            hrApprovedAt: request.hrApprovedAt || null,
            managementApprovedBy: request.managementApprovedBy || null,
            managementApprovedAt: request.managementApprovedAt || null,

            createdAt: request.createdAt,
            updatedAt: request.updatedAt,

            // Denormalized user data for easier querying
            userName: request.user.name,
            userEmail: request.user.email,
            userDepartment: request.user.department || null
        });

        count++;
        batchCount++;

        if (batchCount === 500) {
            await batch.commit();
            console.log(`  ✓ Committed batch of ${batchCount} leave requests`);
            batch = writeBatch(db);
            batchCount = 0;
        }
    }

    if (batchCount > 0) {
        await batch.commit();
        console.log(`  ✓ Committed final batch of ${batchCount} leave requests`);
    }

    console.log(`✅ Migrated ${count} leave requests successfully!`);
}

async function migrateTicketRequests() {
    console.log('\n📦 Migrating Ticket Requests...');

    const ticketRequests = await prisma.ticketRequest.findMany({
        include: {
            leaveRequest: {
                include: {
                    user: true
                }
            }
        }
    });

    console.log(`Found ${ticketRequests.length} ticket requests to migrate`);

    let batch = writeBatch(db);
    let count = 0;
    let batchCount = 0;

    for (const ticket of ticketRequests) {
        const ticketRef = doc(db, 'ticketRequests', ticket.id);

        batch.set(ticketRef, {
            leaveRequestId: ticket.leaveRequestId,
            status: ticket.status,
            route: ticket.route,
            quotes: ticket.quotes || null,
            selectedQuote: ticket.selectedQuote || null,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,

            // Denormalized data for easier querying
            userId: ticket.leaveRequest.userId,
            userName: ticket.leaveRequest.user.name,
            userEmail: ticket.leaveRequest.user.email,
            userDepartment: ticket.leaveRequest.user.department || null,
            userLocation: ticket.leaveRequest.user.location || null,
            leaveStatus: ticket.leaveRequest.status
        });

        count++;
        batchCount++;

        if (batchCount === 500) {
            await batch.commit();
            console.log(`  ✓ Committed batch of ${batchCount} ticket requests`);
            batch = writeBatch(db);
            batchCount = 0;
        }
    }

    if (batchCount > 0) {
        await batch.commit();
        console.log(`  ✓ Committed final batch of ${batchCount} ticket requests`);
    }

    console.log(`✅ Migrated ${count} ticket requests successfully!`);
}

async function main() {
    console.log('🚀 Starting SQLite to Firestore Migration...\n');
    console.log('⚠️  WARNING: This will copy all data from SQLite to Firestore');
    console.log('⚠️  Make sure you have a backup of your SQLite database!\n');

    try {
        // Migrate in order (users first, then dependent data)
        await migrateUsers();
        await migrateLeaveRequests();
        await migrateTicketRequests();

        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📊 Summary:');
        console.log('  - Users: Migrated');
        console.log('  - Leave Requests: Migrated');
        console.log('  - Ticket Requests: Migrated');
        console.log('\n✅ You can now update your API routes to use Firestore!');
        console.log('📝 Next steps:');
        console.log('  1. Deploy Firestore rules: firebase deploy --only firestore:rules');
        console.log('  2. Update API routes to use Firestore');
        console.log('  3. Test the application thoroughly');
        console.log('  4. Keep SQLite as backup until fully tested\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

main();
