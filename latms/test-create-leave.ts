import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        // Fetch a supervisor and an employee
        const supervisor = await prisma.user.findFirst({ where: { role: 'SUPERVISOR' } });
        const employee = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });

        if (!supervisor || !employee) {
            console.error("Supervisor or Employee not found");
            return;
        }

        console.log(`Supervisor: ${supervisor.name} (${supervisor.id})`);
        console.log(`Employee: ${employee.name} (${employee.id})`);

        // Mock payload data
        const leaveType = "Annual Leave";
        const reason = "Test Script Leave";
        const startDate = new Date("2025-12-10");
        const endDate = new Date("2025-12-15");
        const days = 6;

        console.log("Attempting to create leave request...");

        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                userId: employee.id,
                submittedById: supervisor.id,
                type: leaveType,
                startDate: startDate,
                endDate: endDate,
                days: days,
                reason: reason,
                status: "PENDING_HR",
            },
        });

        console.log("Successfully created leave request:", leaveRequest);

    } catch (error) {
        console.error("Error creating leave request:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
