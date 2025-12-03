/**
 * Migration Script: Prisma to Firebase
 * This script migrates all existing data from SQLite (Prisma) to Firebase Firestore
 * 
 * Run with: ts-node scripts/migrate-to-firebase.ts
 * or: npm run migrate:firebase
 */

import { PrismaClient } from '@prisma/client';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { FirebaseConverters } from '../src/types/firebase';

const prisma = new PrismaClient();

async function migrateUsers() {
    console.log('🔄 Migrating Users...');

    const users = await prisma.user.findMany();
    const batch = writeBatch(db);

    for (const user of users) {
        const firebaseUser = FirebaseConverters.convertUserToFirebase(user);
        const userRef = doc(db, 'users', user.id);
        batch.set(userRef, firebaseUser);
    }

    await batch.commit();
    console.log(`✅ Migrated ${users.length} users`);
}

async function migrateLeaveRequests() {
    console.log('🔄 Migrating Leave Requests...');

    const leaveRequests = await prisma.leaveRequest.findMany();
    const batch = writeBatch(db);

    for (const leave of leaveRequests) {
        const firebaseLeave = FirebaseConverters.convertLeaveRequestToFirebase(leave);
        const leaveRef = doc(db, 'leaveRequests', leave.id);
        batch.set(leaveRef, firebaseLeave);
    }

    await batch.commit();
    console.log(`✅ Migrated ${leaveRequests.length} leave requests`);
}

async function migrateTicketRequests() {
    console.log('🔄 Migrating Ticket Requests...');

    const ticketRequests = await prisma.ticketRequest.findMany();
    const batch = writeBatch(db);

    for (const ticket of ticketRequests) {
        const firebaseTicket = FirebaseConverters.convertTicketRequestToFirebase(ticket);
        const ticketRef = doc(db, 'ticketRequests', ticket.id);
        batch.set(ticketRef, firebaseTicket);
    }

    await batch.commit();
    console.log(`✅ Migrated ${ticketRequests.length} ticket requests`);
}

async function verifyMigration() {
    console.log('\n🔍 Verifying Migration...');

    const usersSnapshot = await getDocs(collection(db, 'users'));
    const leaveSnapshot = await getDocs(collection(db, 'leaveRequests'));
    const ticketSnapshot = await getDocs(collection(db, 'ticketRequests'));

    console.log(`📊 Firebase Collection Counts:`);
    console.log(`   - Users: ${usersSnapshot.size}`);
    console.log(`   - Leave Requests: ${leaveSnapshot.size}`);
    console.log(`   - Ticket Requests: ${ticketSnapshot.size}`);

    const prismaUserCount = await prisma.user.count();
    const prismaLeaveCount = await prisma.leaveRequest.count();
    const prismaTicketCount = await prisma.ticketRequest.count();

    console.log(`\n📊 Prisma Record Counts:`);
    console.log(`   - Users: ${prismaUserCount}`);
    console.log(`   - Leave Requests: ${prismaLeaveCount}`);
    console.log(`   - Ticket Requests: ${prismaTicketCount}`);

    const success =
        usersSnapshot.size === prismaUserCount &&
        leaveSnapshot.size === prismaLeaveCount &&
        ticketSnapshot.size === prismaTicketCount;

    if (success) {
        console.log('\n✅ Migration verified successfully!');
    } else {
        console.log('\n⚠️ Migration count mismatch detected!');
    }

    return success;
}

async function main() {
    try {
        console.log('🚀 Starting migration from Prisma to Firebase...\n');

        await migrateUsers();
        await migrateLeaveRequests();
        await migrateTicketRequests();

        const verified = await verifyMigration();

        if (verified) {
            console.log('\n🎉 Migration completed successfully!');
        } else {
            console.log('\n❌ Migration completed with warnings');
        }
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
main();
