import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log("All Users:");
    users.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - Role: ${u.role}, ID: ${u.id}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
