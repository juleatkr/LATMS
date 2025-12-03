import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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
        if (session.user.role !== 'ADMIN' && session.user.role !== 'HR' && session.user.role !== 'ACCOUNTS') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const { status, quotes, selectedQuote } = body

        const updateData: any = {}

        if (status) updateData.status = status
        if (quotes) updateData.quotes = quotes
        if (selectedQuote !== undefined) updateData.selectedQuote = selectedQuote

        const updatedTicket = await prisma.ticketRequest.update({
            where: { id },
            data: updateData,
            include: {
                leaveRequest: {
                    include: {
                        user: {
                            select: {
                                staffCode: true,
                                name: true,
                                email: true,
                                department: true,
                                location: true,
                                ticketEligible: true,
                            },
                        },
                    },
                },
            },
        })

        return NextResponse.json(updatedTicket)
    } catch (error) {
        console.error('Error updating ticket:', error)
        return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
    }
}
