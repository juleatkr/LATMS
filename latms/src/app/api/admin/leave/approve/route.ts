import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { firebaseService } from '@/lib/firebase-service'

export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-ignore
    const userRole = session.user.role
    // @ts-ignore
    const userName = session.user.name

    const body = await request.json()
    const { requestId, action } = body // action: 'approve' or 'reject'

    // Use Firebase Service to get request
    const leaveRequest = await firebaseService.getLeaveRequest(requestId);

    if (!leaveRequest) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Determine next status and update approval tracking
    let newStatus = leaveRequest.status
    let updateData: any = { status: newStatus }

    if (action === 'approve') {
        const now = new Date()

        if (leaveRequest.status === 'PENDING_MANAGER') {
            // Manager/Supervisor approval
            if (userRole !== 'MANAGER' && userRole !== 'SUPERVISOR' && userRole !== 'ADMIN' && userRole !== 'HR') {
                return NextResponse.json({ error: 'Only Manager/Supervisor can approve at this stage' }, { status: 403 })
            }
            newStatus = 'PENDING_HR'
            updateData = {
                status: newStatus,
                managerApprovedBy: userName,
                managerApprovedAt: now
            }
        } else if (leaveRequest.status === 'PENDING_HR') {
            // HR approval
            if (userRole !== 'HR' && userRole !== 'ADMIN') {
                return NextResponse.json({ error: 'Only HR can approve at this stage' }, { status: 403 })
            }
            newStatus = 'PENDING_MANAGEMENT'
            updateData = {
                status: newStatus,
                hrApprovedBy: userName,
                hrApprovedAt: now
            }
        } else if (leaveRequest.status === 'PENDING_MANAGEMENT') {
            // Management/Admin final approval
            if (userRole !== 'ADMIN' && userRole !== 'MANAGEMENT') {
                return NextResponse.json({ error: 'Only Management/Admin can give final approval' }, { status: 403 })
            }
            newStatus = 'APPROVED'
            updateData = {
                status: newStatus,
                managementApprovedBy: userName,
                managementApprovedAt: now
            }
        }
    } else if (action === 'reject') {
        newStatus = 'REJECTED'
        updateData = { status: newStatus }
    }

    // Use Firebase Service to update request
    const updatedRequest = await firebaseService.updateLeaveRequest(requestId, updateData);

    return NextResponse.json(updatedRequest)
}
