import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { firebaseService } from '@/lib/firebase-service'

export async function GET() {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-ignore
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HR' && session.user.role !== 'ACCOUNTS') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use Firebase Service to fetch tickets
    const ticketRequests = await firebaseService.getTicketRequests();

    return NextResponse.json(ticketRequests)
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
    const { ticketRequestId, quotes } = body

    // Use Firebase Service to update ticket
    const updatedTicket = await firebaseService.updateTicketRequest(ticketRequestId, {
        quotes: JSON.stringify(quotes),
        status: 'QUOTES_UPLOADED',
    })

    return NextResponse.json(updatedTicket)
}
