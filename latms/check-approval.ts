import { firebaseService } from './src/lib/firebase-service';
import { db } from './src/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

async function checkApproval() {
    let output = '';

    output += 'Searching for user Rohit Verma...\n';
    const user = await firebaseService.getUserByEmail('7350@al-obaidani.com');

    if (!user) {
        output += 'User not found\n';
        fs.writeFileSync('approval-report.txt', output);
        return;
    }

    output += `Found User: ${user.name} (${user.id})\n`;

    // Fetch leave requests for this user
    const q = query(collection(db, 'leaveRequests'), where('userId', '==', user.id));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        output += 'No leave requests found for this user.\n';
        fs.writeFileSync('approval-report.txt', output);
        return;
    }

    output += `\nFound ${snapshot.size} leave request(s):\n\n`;

    snapshot.docs.forEach(doc => {
        const data = doc.data();

        output += '============================================================\n';
        output += `Request ID: ${doc.id}\n`;
        output += `Type: ${data.type}\n`;
        output += `Status: ${data.status}\n`;
        output += `Start Date: ${data.startDate?.toDate?.() || 'N/A'}\n`;
        output += `End Date: ${data.endDate?.toDate?.() || 'N/A'}\n`;
        output += '------------------------------------------------------------\n';
        output += 'APPROVAL FLOW:\n';
        output += '------------------------------------------------------------\n';

        // Manager/Supervisor Approval
        output += '1. MANAGER/SUPERVISOR APPROVAL:\n';
        if (data.managerApprovedBy) {
            output += `   Approved by: ${data.managerApprovedBy}\n`;
            output += `   Date & Time: ${data.managerApprovedAt?.toDate?.() || 'N/A'}\n`;
        } else {
            output += `   Status: Pending\n`;
        }

        // HR Approval
        output += '\n2. HR APPROVAL:\n';
        if (data.hrApprovedBy) {
            output += `   Approved by: ${data.hrApprovedBy}\n`;
            output += `   Date & Time: ${data.hrApprovedAt?.toDate?.() || 'N/A'}\n`;
        } else {
            output += `   Status: Pending\n`;
        }

        // Management Approval
        output += '\n3. MANAGEMENT APPROVAL:\n';
        if (data.managementApprovedBy) {
            output += `   Approved by: ${data.managementApprovedBy}\n`;
            output += `   Date & Time: ${data.managementApprovedAt?.toDate?.() || 'N/A'}\n`;
        } else {
            output += `   Status: Pending\n`;
        }

        output += '============================================================\n\n';
    });

    fs.writeFileSync('approval-report.txt', output);
    console.log('Report written to approval-report.txt');
    process.exit(0);
}

checkApproval().catch(e => {
    console.error('Error:', e);
    process.exit(1);
});
