/**
 * Firebase Firestore Types
 * These types mirror the Prisma schema for Firebase integration
 */

import { Timestamp } from 'firebase/firestore';

export interface FirebaseUser {
    id: string;
    staffCode: string;
    email: string;
    password?: string; // Added for auth compatibility
    name: string;
    role: 'EMPLOYEE' | 'SUPERVISOR' | 'MANAGER' | 'HR' | 'MANAGEMENT' | 'ACCOUNTS' | 'ADMIN';
    department?: string;
    position?: string;
    location?: string;
    annualLeaveBal: number;
    ticketEligible: boolean;
    supervisorId?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface FirebaseLeaveRequest {
    id: string;
    userId: string;
    submittedById?: string;
    type: 'Annual' | 'Sick' | 'Emergency';
    startDate: Timestamp;
    endDate: Timestamp;
    days: number;
    status: 'PENDING_MANAGER' | 'PENDING_HR' | 'PENDING_MANAGEMENT' | 'APPROVED' | 'REJECTED';
    reason?: string;

    // Approval tracking
    managerApprovedBy?: string;
    managerApprovedAt?: Timestamp;
    hrApprovedBy?: string;
    hrApprovedAt?: Timestamp;
    managementApprovedBy?: string;
    managementApprovedAt?: Timestamp;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface FirebaseTicketRequest {
    id: string;
    leaveRequestId: string;
    status: 'PENDING_QUOTES' | 'QUOTES_UPLOADED' | 'TICKET_ISSUED';
    route: string;
    quotes?: QuoteDetail[];
    selectedQuote?: QuoteDetail;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface QuoteDetail {
    id: string;
    airline: string;
    price: number;
    departureDate: string;
    returnDate: string;
    flightNumber?: string;
    bookingClass?: string;
    notes?: string;
}

// Converter utilities to transform between Prisma and Firebase formats
export class FirebaseConverters {
    static dateToTimestamp(date: Date): Timestamp {
        return Timestamp.fromDate(date);
    }

    static timestampToDate(timestamp: Timestamp): Date {
        return timestamp.toDate();
    }

    static convertUserToFirebase(prismaUser: any): Omit<FirebaseUser, 'id'> {
        return {
            staffCode: prismaUser.staffCode,
            email: prismaUser.email,
            password: prismaUser.password,
            name: prismaUser.name,
            role: prismaUser.role,
            department: prismaUser.department,
            position: prismaUser.position,
            location: prismaUser.location,
            annualLeaveBal: prismaUser.annualLeaveBal,
            ticketEligible: prismaUser.ticketEligible,
            supervisorId: prismaUser.supervisorId,
            createdAt: this.dateToTimestamp(prismaUser.createdAt),
            updatedAt: this.dateToTimestamp(prismaUser.updatedAt)
        };
    }

    static convertLeaveRequestToFirebase(prismaLeave: any): Omit<FirebaseLeaveRequest, 'id'> {
        return {
            userId: prismaLeave.userId,
            submittedById: prismaLeave.submittedById,
            type: prismaLeave.type,
            startDate: this.dateToTimestamp(prismaLeave.startDate),
            endDate: this.dateToTimestamp(prismaLeave.endDate),
            days: prismaLeave.days,
            status: prismaLeave.status,
            reason: prismaLeave.reason,
            managerApprovedBy: prismaLeave.managerApprovedBy,
            managerApprovedAt: prismaLeave.managerApprovedAt ? this.dateToTimestamp(prismaLeave.managerApprovedAt) : undefined,
            hrApprovedBy: prismaLeave.hrApprovedBy,
            hrApprovedAt: prismaLeave.hrApprovedAt ? this.dateToTimestamp(prismaLeave.hrApprovedAt) : undefined,
            managementApprovedBy: prismaLeave.managementApprovedBy,
            managementApprovedAt: prismaLeave.managementApprovedAt ? this.dateToTimestamp(prismaLeave.managementApprovedAt) : undefined,
            createdAt: this.dateToTimestamp(prismaLeave.createdAt),
            updatedAt: this.dateToTimestamp(prismaLeave.updatedAt)
        };
    }

    static convertTicketRequestToFirebase(prismaTicket: any): Omit<FirebaseTicketRequest, 'id'> {
        return {
            leaveRequestId: prismaTicket.leaveRequestId,
            status: prismaTicket.status,
            route: prismaTicket.route,
            quotes: prismaTicket.quotes ? JSON.parse(prismaTicket.quotes) : undefined,
            selectedQuote: prismaTicket.selectedQuote ? JSON.parse(prismaTicket.selectedQuote) : undefined,
            createdAt: this.dateToTimestamp(prismaTicket.createdAt),
            updatedAt: this.dateToTimestamp(prismaTicket.updatedAt)
        };
    }
}
