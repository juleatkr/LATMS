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

    // Use Firebase Service to fetch all users with supervisor details
    const employees = await firebaseService.getAllUsers();

    return NextResponse.json(employees)
}

export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-ignore
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HR') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { staffCode, email, password, name, role, department, location, annualLeaveBal, ticketEligible, supervisorId } = body

    // Check if staff code or email already exists
    const exists = await firebaseService.checkUserExists(staffCode, email);

    if (exists) {
        return NextResponse.json({ error: 'Staff code or email already exists' }, { status: 400 })
    }

    // Create user using Firebase Service
    const employee = await firebaseService.createUser({
        staffCode,
        email,
        password, // In production, hash this!
        name,
        role,
        department,
        location,
        annualLeaveBal: annualLeaveBal || 30,
        ticketEligible: ticketEligible !== undefined ? ticketEligible : true,
        supervisorId: supervisorId || null,
    })

    return NextResponse.json(employee)
}
