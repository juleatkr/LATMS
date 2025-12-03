import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { firebaseService } from '@/lib/firebase-service'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // @ts-ignore
        if (session.user.role !== 'ADMIN' && session.user.role !== 'HR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const { staffCode, email, password, name, role, department, location, annualLeaveBal, ticketEligible, supervisorId } = body

        const updateData: any = {
            staffCode,
            email,
            name,
            role,
            department,
            location,
            annualLeaveBal,
            ticketEligible,
            supervisorId: supervisorId || null,
        }

        // Only update password if provided
        if (password) {
            updateData.password = password
        }

        // Use Firebase Service to update user
        const employee = await firebaseService.updateUser(id, updateData);

        return NextResponse.json(employee)
    } catch (error) {
        console.error('Error updating employee:', error)
        return NextResponse.json(
            { error: 'Failed to update employee' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // @ts-ignore
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        // Use Firebase Service to delete user
        await firebaseService.deleteUser(id);

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting employee:', error)
        return NextResponse.json(
            { error: 'Failed to delete employee' },
            { status: 500 }
        )
    }
}
