import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
    const csvFilePath = path.resolve(__dirname, '../../docs/Sponsorwise Employee List 02-12-25.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

interface EmployeeRecord {
    'Staff Code': string;
    'Name': string;
    'Email': string;
    'Department': string;
    'Location': string;
    'Role': string;
    'Supervisor': string;
    'Leave Bal': string;
}

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as EmployeeRecord[];

    console.log(`Found ${records.length} records to process.`);

    let processed = 0;
    let skipped = 0;

    for (const record of records) {
        const staffCode = record['Staff Code'];
        const name = record['Name'];
        let email = record['Email'];
        const department = record['Department'];
        const location = record['Location'];
        const position = record['Role']; // CSV 'Role' -> DB 'position'
        const isSupervisor = record['Supervisor']?.toUpperCase() === 'YES';
        const leaveBal = parseInt(record['Leave Bal'] || '30', 10);

        if (!staffCode || !name) {
            console.warn(`Skipping record with missing staffCode or name`);
            skipped++;
            continue;
        }

        // Generate email if missing
        if (!email || email.trim() === '') {
            email = `${staffCode}@al-obaidani.com`;
        }

        const role = isSupervisor ? 'SUPERVISOR' : 'EMPLOYEE';

        try {
            await prisma.user.upsert({
                where: { staffCode: staffCode },
                update: {
                    name,
                    email,
                    department,
                    location,
                    position,
                    role,
                    annualLeaveBal: leaveBal,
                },
                create: {
                    staffCode,
                    name,
                    email,
                    password: 'user123', // Default password for all imported users
                    department,
                    location,
                    position,
                    role,
                    annualLeaveBal: leaveBal,
                },
            });
            processed++;
        } catch (error) {
            console.error(`Error processing user ${staffCode} (${name}):`, error);
            skipped++;
        }
    }

    console.log(`\nSeeding completed!`);
    console.log(`✓ Processed: ${processed} employees`);
    console.log(`✗ Skipped: ${skipped} records`);
}

main()
    .catch((e) => {
        console.error('Fatal error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
