/**
 * Dual-Write Service for Prisma and Firebase
 * This service ensures data consistency between SQLite (Prisma) and Firebase Firestore
 * 
 * Usage in API routes:
 * import { dualWriteService } from '@/lib/dual-write-service';
 * await dualWriteService.createLeaveRequest(data);
 */

import { PrismaClient } from '@prisma/client';
import { doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { FirebaseConverters } from '@/types/firebase';

const prisma = new PrismaClient();

class DualWriteService {
    /**
     * Create a user in both Prisma and Firebase
     */
    async createUser(userData: any) {
        try {
            // Create in Prisma first
            const prismaUser = await prisma.user.create({
                data: userData
            });

            // Sync to Firebase
            const firebaseUser = FirebaseConverters.convertUserToFirebase(prismaUser);
            await setDoc(doc(db, 'users', prismaUser.id), firebaseUser);

            return prismaUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Update a user in both Prisma and Firebase
     */
    async updateUser(userId: string, userData: any) {
        try {
            // Update in Prisma
            const prismaUser = await prisma.user.update({
                where: { id: userId },
                data: userData
            });

            // Sync to Firebase
            const firebaseUser = FirebaseConverters.convertUserToFirebase(prismaUser);
            await setDoc(doc(db, 'users', userId), firebaseUser, { merge: true });

            return prismaUser;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Delete a user from both Prisma and Firebase
     */
    async deleteUser(userId: string) {
        try {
            // Delete from Prisma
            await prisma.user.delete({
                where: { id: userId }
            });

            // Delete from Firebase
            await deleteDoc(doc(db, 'users', userId));

            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Create a leave request in both Prisma and Firebase
     */
    async createLeaveRequest(leaveData: any) {
        try {
            // Create in Prisma
            const prismaLeave = await prisma.leaveRequest.create({
                data: leaveData
            });

            // Sync to Firebase
            const firebaseLeave = FirebaseConverters.convertLeaveRequestToFirebase(prismaLeave);
            await setDoc(doc(db, 'leaveRequests', prismaLeave.id), firebaseLeave);

            return prismaLeave;
        } catch (error) {
            console.error('Error creating leave request:', error);
            throw error;
        }
    }

    /**
     * Update a leave request in both Prisma and Firebase
     */
    async updateLeaveRequest(leaveId: string, leaveData: any) {
        try {
            // Update in Prisma
            const prismaLeave = await prisma.leaveRequest.update({
                where: { id: leaveId },
                data: leaveData
            });

            // Sync to Firebase
            const firebaseLeave = FirebaseConverters.convertLeaveRequestToFirebase(prismaLeave);
            await setDoc(doc(db, 'leaveRequests', leaveId), firebaseLeave, { merge: true });

            return prismaLeave;
        } catch (error) {
            console.error('Error updating leave request:', error);
            throw error;
        }
    }

    /**
     * Delete a leave request from both Prisma and Firebase
     */
    async deleteLeaveRequest(leaveId: string) {
        try {
            // Delete from Prisma
            await prisma.leaveRequest.delete({
                where: { id: leaveId }
            });

            // Delete from Firebase
            await deleteDoc(doc(db, 'leaveRequests', leaveId));

            return true;
        } catch (error) {
            console.error('Error deleting leave request:', error);
            throw error;
        }
    }

    /**
     * Create a ticket request in both Prisma and Firebase
     */
    async createTicketRequest(ticketData: any) {
        try {
            // Create in Prisma
            const prismaTicket = await prisma.ticketRequest.create({
                data: ticketData
            });

            // Sync to Firebase
            const firebaseTicket = FirebaseConverters.convertTicketRequestToFirebase(prismaTicket);
            await setDoc(doc(db, 'ticketRequests', prismaTicket.id), firebaseTicket);

            return prismaTicket;
        } catch (error) {
            console.error('Error creating ticket request:', error);
            throw error;
        }
    }

    /**
     * Update a ticket request in both Prisma and Firebase
     */
    async updateTicketRequest(ticketId: string, ticketData: any) {
        try {
            // Update in Prisma
            const prismaTicket = await prisma.ticketRequest.update({
                where: { id: ticketId },
                data: ticketData
            });

            // Sync to Firebase
            const firebaseTicket = FirebaseConverters.convertTicketRequestToFirebase(prismaTicket);
            await setDoc(doc(db, 'ticketRequests', ticketId), firebaseTicket, { merge: true });

            return prismaTicket;
        } catch (error) {
            console.error('Error updating ticket request:', error);
            throw error;
        }
    }

    /**
     * Delete a ticket request from both Prisma and Firebase
     */
    async deleteTicketRequest(ticketId: string) {
        try {
            // Delete from Prisma
            await prisma.ticketRequest.delete({
                where: { id: ticketId }
            });

            // Delete from Firebase
            await deleteDoc(doc(db, 'ticketRequests', ticketId));

            return true;
        } catch (error) {
            console.error('Error deleting ticket request:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const dualWriteService = new DualWriteService();
