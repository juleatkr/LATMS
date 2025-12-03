# Firebase Integration Setup Guide

## Overview
This guide will help you complete the Firebase integration for the LATMS application. The integration provides:
- Real-time data synchronization
- Cloud-based database (Firebase Firestore)
- Dual-write capability (maintains both SQLite and Firebase)
- Scalability for future growth

## Step 1: Install Dependencies

First, make sure you have `tsx` installed for running TypeScript migration scripts:

```bash
npm install -D tsx
```

## Step 2: Generate Prisma Client

The Prisma client needs to be regenerated to include all schema fields:

```bash
npx prisma generate
```

## Step 3: Run the Migration

Run the migration script to sync your existing SQLite data to Firebase:

```bash
npm run migrate:firebase
```

Or use the alternate migration script:

```bash
npx tsx scripts/migrate-to-firestore.ts
```

## Step 4: Verify Migration

After migration completes, you should see:
- ✅ User count in Firebase matches SQLite
- ✅ Leave request count matches
- ✅ Ticket request count matches

Log into the [Firebase Console](https://console.firebase.google.com/u/0/project/obaidani-latms/firestore) to visually verify your data.

## Step 5: Update API Routes (Optional)

You can now update your API routes to use the dual-write service to keep both databases in sync automatically.

### Example: Update Leave Request API

```typescript
// Before (Prisma only)
import { prisma } from '@/lib/prisma';
const leave = await prisma.leaveRequest.create({ data });

// After (Dual-write to both)
import { dualWriteService } from '@/lib/dual-write-service';
const leave = await dualWriteService.createLeaveRequest(data);
```

## Step 6: Firebase Security Rules

Deploy the following security rules to Firebase:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'MANAGEMENT'];
    }
    
    function isHR() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'HR';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Leave requests
    match /leaveRequests/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId) || isHR() || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Ticket requests
    match /ticketRequests/{ticketId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isHR() || isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

Save these rules in `firestore.rules` and deploy:

```bash
firebase deploy --only firestore:rules
```

## Architecture

### Dual-Write Pattern
The application now uses a dual-write pattern:

1. **Write Operation**: Data is written to both SQLite and Firebase
2. **Read Operation**: Data is read from SQLite (faster for local queries)
3. **Sync**: Firebase acts as cloud backup and enables real-time features

### Files Created

| File | Purpose |
|------|---------|
| `src/types/firebase.ts` | TypeScript types matching Prisma schema |
| `src/lib/dual-write-service.ts` | Service for writing to both databases |
| `src/hooks/useFirebase.ts` | React hooks for Firebase operations |
| `scripts/migrate-to-firebase.ts` | Migration script (new) |
| `scripts/migrate-to-firestore.ts` | Migration script (existing) |

## Usage Examples

### Using Firebase Hooks in Components

```typescript
import { useFirestore } from '@/hooks/useFirebase';
import { FirebaseLeaveRequest } from '@/types/firebase';
import { where } from 'firebase/firestore';

function MyComponent() {
  const { getDocuments, loading, error } = useFirestore<FirebaseLeaveRequest>();
  
  useEffect(() => {
    const fetchData = async () => {
      const leaves = await getDocuments('leaveRequests', [
        where('status', '==', 'APPROVED')
      ]);
      console.log(leaves);
    };
    
    fetchData();
  }, []);
  
  return <div>...</div>;
}
```

### Using Dual-Write Service

```typescript
import { dualWriteService } from '@/lib/dual-write-service';

// Creating a user
const newUser = await dualWriteService.createUser({
  staffCode: 'EMP001',
  email: 'user@example.com',
  name: 'John Doe',
  // ... other fields
});

// Updating a leave request
const updated = await dualWriteService.updateLeaveRequest(leaveId, {
  status: 'APPROVED',
  hrApprovedBy: 'HR Manager',
  hrApprovedAt: new Date()
});
```

## Troubleshooting

### Error: "Spread types may only be created from object types"
**Solution**: This has been fixed by adding null checks in the useFirebase hook.

### Error: "Property does not exist on type"
**Solution**: Run `npx prisma generate` to regenerate the Prisma client.

### Migration fails
**Solution**: 
1. Check your Firebase credentials in `src/lib/firebase.ts`
2. Ensure you have write permissions in Firebase Console
3. Check your network connection

### Data not syncing
**Solution**:
1. Verify Firebase rules are deployed
2. Check browser console for errors
3. Ensure dual-write service is being used in API routes

## Next Steps

1. ✅ Fix TypeScript error (DONE)
2. ✅ Create types and converters (DONE)
3. ✅ Create dual-write service (DONE)
4. ✅ Create migration scripts (DONE)
5. 🔄 Run migration (`npm run migrate:firebase`)
6. 🔄 Deploy Firebase rules
7. 🔄 Update API routes to use dual-write service
8. 🔄 Test the application

## Support

If you encounter any issues:
1. Check the Firebase Console for errors
2. Review the migration script output
3. Verify your Prisma schema is up to date
4. Ensure all dependencies are installed
