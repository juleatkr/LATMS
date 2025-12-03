import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { firebaseService } from "@/lib/firebase-service";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // In a real app, we might filter tickets by user role here
        // For now, we'll fetch all and let the service handle basic ordering
        const tickets = await firebaseService.getTicketRequests();

        return NextResponse.json({ success: true, data: tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    }
}
