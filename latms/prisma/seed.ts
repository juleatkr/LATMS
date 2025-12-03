import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@al-obaidani.com' },
        update: {},
        create: {
            staffCode: 'HR:001',
            email: 'admin@al-obaidani.com',
            name: 'HR Admin',
            password: 'admin123',
            role: 'ADMIN',
            department: 'HR',
            location: 'HO',
            ticketEligible: true,
        },
    })

    // Create Supervisor
    const supervisor = await prisma.user.upsert({
        where: { email: 'supervisor@al-obaidani.com' },
        update: {},
        create: {
            staffCode: 'SUP:001',
            email: 'supervisor@al-obaidani.com',
            name: 'Ahmed Al-Balushi',
            password: 'supervisor123',
            role: 'SUPERVISOR',
            department: 'Sales',
            location: 'Muscat Branch',
            annualLeaveBal: 30,
            ticketEligible: true,
        },
    })

    // Create Employee (Jay Kay)
    const employee = await prisma.user.upsert({
        where: { email: 'employee@al-obaidani.com' },
        update: {},
        create: {
            staffCode: 'EC:6143',
            email: 'employee@al-obaidani.com',
            name: 'Jay Kay',
            password: 'user123',
            role: 'EMPLOYEE',
            department: 'Sales',
            location: 'Muscat Branch',
            annualLeaveBal: 24,
            ticketEligible: true,
            supervisorId: supervisor.id,
        },
    })

    // Create Employee (Sudhan)
    const sudhan = await prisma.user.upsert({
        where: { email: 'sudhan@al-obaidani.com' },
        update: {},
        create: {
            staffCode: 'EC:6144',
            email: 'sudhan@al-obaidani.com',
            name: 'Sudhan',
            password: '123456',
            role: 'EMPLOYEE',
            department: 'Sales',
            location: 'Muscat Branch',
            annualLeaveBal: 24,
            ticketEligible: true,
            supervisorId: supervisor.id,
        },
    })

    console.log({ admin, supervisor, employee, sudhan })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

