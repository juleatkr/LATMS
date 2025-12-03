import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { firebaseService } from "@/lib/firebase-service";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use Firebase Service to fetch employees
        const employees = await firebaseService.getEmployees(session.user.id);

        return NextResponse.json({ success: true, data: employees });
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
}
