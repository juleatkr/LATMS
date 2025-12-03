/**
 * Updated Leave Requests API Route with Firebase Dual-Write
 * 
 * This is a reference implementation showing how to integrate the dual-write service.
 * To use this:
 * 1. Backup your current route.ts
 * 2. Replace the imports and database operations as shown below
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dualWriteService } from "@/lib/dual-write-service"; // NEW: Import dual-write service

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            employeeId,
            leaveType,
            reason,
            startDate,
            endDate,
            days,
            ticketRequired,
            ticketType,
            dependentTickets,
            route,
            supervisorNotes,
            contactDestination,
            contactPhone
        } = body;

        console.log("Received leave request payload:", body);

        const isSupervisorPosting = employeeId && employeeId !== session.user.id;
        const targetUserId = isSupervisorPosting ? employeeId : session.user.id;
        const submittedById = isSupervisorPosting ? session.user.id : session.user.id;

        console.log(`Creating leave request for ${targetUserId} by ${submittedById}`);

        // UPDATED: Use dual-write service instead of direct Prisma
        const leaveRequest = await dualWriteService.createLeaveRequest({
            userId: targetUserId,
            submittedById: submittedById,
            type: leaveType,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            days: Number(days),
            reason: reason,
            status: isSupervisorPosting ? "PENDING_HR" : "PENDING_SUPERVISOR",
        });

        console.log("Leave request created (synced to both DBs):", leaveRequest.id);

        // If ticket is required, create ticket request
        if (ticketRequired) {
            console.log("Creating ticket request...");
            // UPDATED: Use dual-write service for ticket requests too
            await dualWriteService.createTicketRequest({
                leaveRequestId: leaveRequest.id,
                status: "PENDING_QUOTES",
                route: route || "Not specified",
            });
            console.log("Ticket request created (synced to both DBs)");
        }

        return NextResponse.json({ success: true, data: leaveRequest });
    } catch (error: any) {
        console.error("Error creating leave request:", error);
        console.error("Error stack:", error.stack);
        return NextResponse.json({ error: "Failed to create leave request", details: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const type = searchParams.get("type");
        const fromDate = searchParams.get("fromDate");
        const toDate = searchParams.get("toDate");

        // Build filter conditions
        const where: any = {};

        // @ts-ignore
        const userRole = session.user.role;

        if (userRole === 'ADMIN' || userRole === 'HR' || userRole === 'ACCOUNTS') {
            // Can view all
        } else if (userRole === 'SUPERVISOR') {
            const subordinates = await prisma.user.findMany({
                where: { supervisorId: session.user.id },
                select: { id: true }
            });
            const subordinateIds = subordinates.map(s => s.id);

            where.OR = [
                { userId: session.user.id },
                { userId: { in: subordinateIds } },
                { submittedById: session.user.id }
            ];
        } else {
            where.userId = session.user.id;
        }

        if (status && status !== 'All') where.status = status;
        if (type && type !== 'All') where.type = type;

        if (fromDate) {
            where.startDate = { gte: new Date(fromDate) };
        }
        if (toDate) {
            where.endDate = { lte: new Date(toDate) };
        }

        // NOTE: For read operations, we still use Prisma (it's faster for local queries)
        // Firebase is used for writes and as a cloud backup
        const requests = await prisma.leaveRequest.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        department: true,
                        staffCode: true
                    }
                },
                ticketRequest: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, data: requests });

    } catch (error) {
        console.error("Error fetching leave requests:", error);
        return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
    }
}
