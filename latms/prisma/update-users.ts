import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUsers() {
    try {
        // Delete all related records first
        await prisma.ticketRequest.deleteMany({})
        console.log('Deleted all ticket requests')

        await prisma.leaveRequest.deleteMany({})
        console.log('Deleted all leave requests')

        // Delete all existing users
        await prisma.user.deleteMany({})
        console.log('Deleted all existing users')

        // Create Admin
        const admin = await prisma.user.create({
            data: {
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
        console.log('Created admin:', admin.email)

        // Create Supervisor
        const supervisor = await prisma.user.create({
            data: {
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
        console.log('Created supervisor:', supervisor.email)

        // Create Employee (Jay Kay)
        const employee = await prisma.user.create({
            data: {
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
        console.log('Created employee:', employee.email)

        // Create Employee (Sudhan)
        const sudhan = await prisma.user.create({
            data: {
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
        console.log('Created employee:', sudhan.email)

        console.log('\n✅ Database updated successfully!')
        console.log('\nDemo Credentials:')
        console.log('Admin: admin@al-obaidani.com / admin123')
        console.log('Supervisor: supervisor@al-obaidani.com / supervisor123')
        console.log('Employee: employee@al-obaidani.com / user123')
        console.log('Employee: sudhan@al-obaidani.com / 123456')
    } catch (error) {
        console.error('Error updating users:', error)
    }
}

updateUsers()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

