# 🔥 SQLite to Firestore Migration Guide

## ✅ Migration Status

Your LATMS application is being migrated from SQLite to Firebase Firestore!

---

## 📋 What's Been Done

### 1. **Firestore Security Rules Created** ✅
- File: `firestore.rules`
- Role-based access control implemented
- Secure read/write permissions for all collections

### 2. **Firebase Configuration Updated** ✅
- `firebase.json` - Includes Firestore rules
- `firestore.indexes.json` - Optimized query indexes

### 3. **Migration Script Created** ✅
- File: `scripts/migrate-to-firestore.ts`
- Migrates: Users, Leave Requests, Ticket Requests
- Uses batch operations for efficiency

---

## 🚀 Migration Steps

### **Step 1: Run the Migration Script**

```bash
npx tsx scripts/migrate-to-firestore.ts
```

This will:
- ✅ Copy all 396 users from SQLite to Firestore
- ✅ Copy all leave requests with approval history
- ✅ Copy all ticket requests with quotes
- ✅ Preserve all relationships and timestamps

**Expected Output:**
```
📦 Migrating Users...
Found 396 users to migrate
  ✓ Committed batch of 396 users
✅ Migrated 396 users successfully!

📦 Migrating Leave Requests...
...
```

---

### **Step 2: Deploy Firestore Rules**

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

---

### **Step 3: Update API Routes** (Next Phase)

After migration is complete, we'll update all API routes to use Firestore instead of Prisma/SQLite.

**Files to update:**
- `/api/admin/leave/route.ts`
- `/api/admin/leave/approve/route.ts`
- `/api/admin/tickets/route.ts`
- `/api/admin/tickets/[id]/route.ts`
- `/api/leave-requests/route.ts`
- `/api/tickets/route.ts`
- And all other API routes

---

## 📊 Firestore Data Structure

### **Users Collection** (`users/{userId}`)
```typescript
{
  id: string (document ID)
  staffCode: string
  email: string
  password: string
  name: string
  role: string
  department: string | null
  position: string | null
  location: string | null
  annualLeaveBal: number
  ticketEligible: boolean
  supervisorId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### **Leave Requests Collection** (`leaveRequests/{requestId}`)
```typescript
{
  id: string (document ID)
  userId: string
  submittedById: string | null
  type: string
  startDate: Timestamp
  endDate: Timestamp
  days: number
  status: string
  reason: string | null
  
  // Approval tracking
  managerApprovedBy: string | null
  managerApprovedAt: Timestamp | null
  hrApprovedBy: string | null
  hrApprovedAt: Timestamp | null
  managementApprovedBy: string | null
  managementApprovedAt: Timestamp | null
  
  // Denormalized data (for faster queries)
  userName: string
  userEmail: string
  userDepartment: string | null
  
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### **Ticket Requests Collection** (`ticketRequests/{ticketId}`)
```typescript
{
  id: string (document ID)
  leaveRequestId: string
  status: string
  route: string
  quotes: string | null (JSON)
  selectedQuote: string | null (JSON)
  
  // Denormalized data
  userId: string
  userName: string
  userEmail: string
  userDepartment: string | null
  userLocation: string | null
  leaveStatus: string
  
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 🔐 Security Rules Overview

### **Users**
- ✅ All authenticated users can read user data
- ✅ Only admins can create/update/delete users
- ✅ Users can update their own profile (limited fields)

### **Leave Requests**
- ✅ Users can read their own requests
- ✅ Supervisors/Admins can read all requests
- ✅ Users can create their own requests
- ✅ Only supervisors can approve/reject
- ✅ Only admins can delete

### **Ticket Requests**
- ✅ Admins/HR can read all tickets
- ✅ Users can read tickets linked to their leave requests
- ✅ Only admins/HR can create/update tickets

---

## 🎯 Benefits of Firestore

### **1. Real-time Updates**
```typescript
// Listen for real-time changes
import { onSnapshot, collection } from 'firebase/firestore';

onSnapshot(collection(db, 'leaveRequests'), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      console.log('New request:', change.doc.data());
    }
  });
});
```

### **2. Offline Support**
- Firestore caches data locally
- Works offline automatically
- Syncs when connection restored

### **3. Scalability**
- No database size limits
- Automatic scaling
- Global distribution

### **4. No Server Maintenance**
- Fully managed by Google
- Automatic backups
- Built-in security

---

## 📝 Next Steps

### **Immediate (After Migration):**
1. ✅ Verify data in Firebase Console
   - https://console.firebase.google.com/project/obaidani-latms/firestore

2. ✅ Deploy security rules
   ```bash
   firebase deploy --only firestore:rules
   ```

3. ✅ Test queries in Firestore Console

### **Phase 2 (Update Application):**
1. Update all API routes to use Firestore
2. Replace Prisma calls with Firestore SDK
3. Test each feature thoroughly
4. Update authentication to use Firebase Auth (optional)

### **Phase 3 (Cleanup):**
1. Remove Prisma dependencies
2. Delete SQLite database (after thorough testing)
3. Update deployment configuration

---

## ⚠️ Important Notes

### **Data Denormalization**
Firestore works best with denormalized data. We've added:
- User names/emails to leave requests
- User info to ticket requests
- This allows faster queries without joins

### **Backup Strategy**
- ✅ Keep SQLite database as backup
- ✅ Export Firestore data regularly
- ✅ Use Firebase's built-in backup feature

### **Cost Monitoring**
Free tier limits:
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage

Your current usage (396 users, ~100 requests):
- Well within free tier
- Estimated cost: $0/month

---

## 🔗 Useful Commands

```bash
# View Firestore data
firebase firestore:indexes

# Export data
firebase firestore:export gs://obaidani-latms.appspot.com/backups

# Import data
firebase firestore:import gs://obaidani-latms.appspot.com/backups

# Delete collection (use with caution!)
firebase firestore:delete --all-collections
```

---

## 🆘 Troubleshooting

### **Migration fails?**
- Check Firebase Console for errors
- Verify internet connection
- Check Firebase project permissions

### **Security rules not working?**
- Deploy rules: `firebase deploy --only firestore:rules`
- Check Firebase Console > Firestore > Rules tab
- Test rules in the Rules Playground

### **Queries slow?**
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Check Firebase Console > Firestore > Indexes tab
- Firestore will suggest missing indexes

---

## 📞 Support

- **Firebase Console:** https://console.firebase.google.com/project/obaidani-latms
- **Firebase Docs:** https://firebase.google.com/docs/firestore
- **Status Page:** https://status.firebase.google.com

---

**🎉 Your data migration is ready! Run the migration script to begin.**
