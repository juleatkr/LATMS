# Firebase Integration - Action Checklist

## ✅ Completed Steps

- [x] Fixed TypeScript error in `useFirebase.ts`
- [x] Created Firebase types (`src/types/firebase.ts`)
- [x] Created dual-write service (`src/lib/dual-write-service.ts`)
- [x] Enhanced Firebase hooks with generics
- [x] Created migration scripts
- [x] Created Firebase security rules (`firestore.rules`)
- [x] Added `tsx` dependency
- [x] Added migration script to `package.json`
- [x] Created documentation

## 🔄 Next Steps (To Do)

### 1. Fix Environment Variables

**Status**: ⚠️ REQUIRED

Your `.env` file is open in your editor. Please verify it contains:

```env
DATABASE_URL="file:./prisma/dev.db"
```

**How to check**:
1. Look at the `.env` tab in your editor
2. Make sure the `DATABASE_URL` line exists
3. Save the file

### 2. Regenerate Prisma Client

**Status**: ⚠️ REQUIRED (Waiting for Step 1)

**Command**:
```bash
npx prisma generate
```

**Purpose**: This fixes the TypeScript errors about missing properties and ensures Prisma knows about all schema fields.

### 3. Run Migration to Firebase

**Status**: ⏳ READY (Waiting for Step 2)

**Command** (choose one):
```bash
# Option 1: New migration script
npm run migrate:firebase

# Option 2: Existing migration script
npx tsx scripts/migrate-to-firestore.ts
```

**What this does**:
- Copies all users from SQLite to Firebase
- Copies all leave requests to Firebase
- Copies all ticket requests to Firebase
- Verifies the counts match

**Expected output**:
```
🚀 Starting migration from Prisma to Firebase...
🔄 Migrating Users...
✅ Migrated 50 users
🔄 Migrating Leave Requests...
✅ Migrated 120 leave requests
🔄 Migrating Ticket Requests...
✅ Migrated 35 ticket requests
✅ Migration verified successfully!
🎉 Migration completed successfully!
```

### 4. Deploy Firebase Security Rules

**Status**: ⏳ OPTIONAL

**Command**:
```bash
firebase deploy --only firestore:rules
```

**Purpose**: Secures your Firebase database with role-based access control.

**Note**: You already have Firebase configured (I can see `.firebaserc` and `firebase.json`), so this should work immediately.

### 5. Update API Routes

**Status**: ⏳ RECOMMENDED

**Files to update**:
- `src/app/api/leave-requests/route.ts`
- `src/app/api/admin/leave/route.ts`
- `src/app/api/admin/tickets/route.ts`
- `src/app/api/tickets/route.ts`

**Reference**: See `docs/EXAMPLE_UPDATED_ROUTE.ts` for an example

**Changes needed**:
```typescript
// OLD (Prisma only)
const leave = await prisma.leaveRequest.create({ data });

// NEW (Dual-write to both databases)
import { dualWriteService } from '@/lib/dual-write-service';
const leave = await dualWriteService.createLeaveRequest(data);
```

**Why**: This ensures all new data is automatically synced to Firebase.

## 📊 Quick Reference

### Files You Can Edit Now

| File | What to Check |
|------|--------------|
| `.env` | Add `DATABASE_URL="file:./prisma/dev.db"` |

### Commands to Run (In Order)

```bash
# 1. Generate Prisma client (after fixing .env)
npx prisma generate

# 2. Migrate data to Firebase
npm run migrate:firebase

# 3. (Optional) Deploy Firebase rules
firebase deploy --only firestore:rules

# 4. Test your application
npm run dev
```

### Verification Steps

After migration:
1. ✅ Check Firebase Console: https://console.firebase.google.com/u/0/project/obaidani-latms/firestore
2. ✅ Verify collection counts match your SQLite database
3. ✅ Test creating a new leave request (should sync to both DBs)

## 🆘 Troubleshooting

### Issue: "Missing required environment variable: DATABASE_URL"
**Solution**: Add `DATABASE_URL="file:./prisma/dev.db"` to your `.env` file

### Issue: "Property does not exist on type"
**Solution**: Run `npx prisma generate` after fixing the .env file

### Issue: Migration script fails
**Check**:
1. Is `DATABASE_URL` set in `.env`?
2. Does `prisma/dev.db` file exist? (Yes ✅)
3. Do you have internet connection?
4. Are Firebase credentials correct in `src/lib/firebase.ts`? (Yes ✅)

## 📚 Documentation Links

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Integration Summary](./FIREBASE_INTEGRATION_SUMMARY.md)
- [Environment Setup](./ENV_SETUP.md)
- [Example Updated Route](./EXAMPLE_UPDATED_ROUTE.ts)

## 🎯 What You're Getting

After completing all steps:
- ✅ **Real-time sync**: Data is backed up to Firebase automatically
- ✅ **Type safety**: Full TypeScript support
- ✅ **Dual database**: SQLite for fast local queries, Firebase for cloud backup
- ✅ **Scalability**: Ready to handle growth
- ✅ **Security**: Role-based access control in Firebase

---

**Current Status**: Ready for Step 1 (Check .env file)

**Estimated Time**: 5-10 minutes to complete all steps
