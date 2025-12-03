import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { firebaseService } from '@/lib/firebase-service'

export async function GET() {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-ignore
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HR') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use Firebase Service to fetch all leave requests
    const requests = await firebaseService.getLeaveRequests({
        userRole: 'ADMIN', // Force admin role to see all
        currentUserId: session.user.id
    });

    return NextResponse.json(requests)
}
