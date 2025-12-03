import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { firebaseService } from "@/lib/firebase-service";

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

        // Determine who is the user (employee) and who submitted it
        const isSupervisorPosting = employeeId && employeeId !== session.user.id;
        const targetUserId = isSupervisorPosting ? employeeId : session.user.id;
        const submittedById = session.user.id;

        // Fetch user details to denormalize
        const targetUser = await firebaseService.getUser(targetUserId);

        console.log(`Creating leave request for ${targetUserId} by ${submittedById}`);

        // Create the leave request using Firebase Service
        const leaveRequest = await firebaseService.createLeaveRequest({
            userId: targetUserId,
            submittedById: submittedById,
            type: leaveType,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            days: Number(days),
            reason: reason,
            status: isSupervisorPosting ? "PENDING_HR" : "PENDING_SUPERVISOR",

            // Denormalized data for easier querying
            userName: targetUser?.name || 'Unknown',
            userEmail: targetUser?.email || '',
            userDepartment: targetUser?.department || ''
        });

        console.log("Leave request created:", leaveRequest.id);

        // If ticket is required, create ticket request
        if (ticketRequired) {
            console.log("Creating ticket request...");
            await firebaseService.createTicketRequest({
                leaveRequestId: leaveRequest.id,
                status: "PENDING_QUOTES",
                route: route || "Not specified",

                // Denormalized data
                userId: targetUserId,
                userName: targetUser?.name,
                userEmail: targetUser?.email,
                userDepartment: targetUser?.department,
                leaveStatus: leaveRequest.status
            });
            console.log("Ticket request created");
        }

        return NextResponse.json({ success: true, data: leaveRequest });
    } catch (error: any) {
        console.error("Error creating leave request:", error);
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
        const status = searchParams.get("status") || undefined;
        const type = searchParams.get("type") || undefined;
        const fromDate = searchParams.get("fromDate") ? new Date(searchParams.get("fromDate")!) : undefined;
        const toDate = searchParams.get("toDate") ? new Date(searchParams.get("toDate")!) : undefined;

        // @ts-ignore
        const userRole = session.user.role;

        // Use Firebase Service to fetch data
        const requests = await firebaseService.getLeaveRequests({
            userRole,
            currentUserId: session.user.id,
            status,
            type,
            fromDate,
            toDate
        });

        return NextResponse.json({ success: true, data: requests });

    } catch (error) {
        console.error("Error fetching leave requests:", error);
        return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
    }
}
