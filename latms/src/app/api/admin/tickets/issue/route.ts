import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-ignore
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HR' && session.user.role !== 'MANAGEMENT') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { ticketRequestId } = body

    const updatedTicket = await prisma.ticketRequest.update({
        where: { id: ticketRequestId },
        data: {
            status: 'TICKET_ISSUED',
        },
    })

    return NextResponse.json(updatedTicket)
}
