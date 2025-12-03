import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { firebaseService } from '@/lib/firebase-service'

export async function GET() {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use Firebase Service to fetch own leave requests
    const requests = await firebaseService.getLeaveRequests({
        currentUserId: session.user.id,
        // No role passed means it defaults to employee view (own requests)
    });

    return NextResponse.json(requests)
}

export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, startDate, endDate, days, reason, ticketRequired, route } = body

    // Fetch user details for denormalization
    const user = await firebaseService.getUser(session.user.id);

    // Create leave request using Firebase Service
    const leaveRequest = await firebaseService.createLeaveRequest({
        userId: session.user.id,
        submittedById: session.user.id, // Self submission
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason,
        status: 'PENDING_MANAGER',

        // Denormalized data
        userName: user?.name || 'Unknown',
        userEmail: user?.email || '',
        userDepartment: user?.department || ''
    })

    // Create ticket request if needed
    if (ticketRequired && route) {
        await firebaseService.createTicketRequest({
            leaveRequestId: leaveRequest.id,
            route,
            status: 'PENDING_QUOTES',

            // Denormalized data
            userId: session.user.id,
            userName: user?.name,
            userEmail: user?.email,
            userDepartment: user?.department,
            leaveStatus: leaveRequest.status
        })
    }

    return NextResponse.json(leaveRequest)
}
