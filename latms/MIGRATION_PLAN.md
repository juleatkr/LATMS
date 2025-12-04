# 🎯 MIGRATION PLAN: All 300 Employees

## ✅ Recommended Approach

**Keep existing Firestore document IDs, create Firebase Auth users to match!**

### Why This is Better:
- ✅ No need to change 300 Firestore documents
- ✅ No risk of breaking existing data
- ✅ Preserves all relationships (leave requests, tickets, etc.)
- ✅ One script does everything
- ✅ Much safer and faster

---

## 📋 Step-by-Step Migration Process

### **Step 1: Download Firebase Service Account Key**

1. Go to: https://console.firebase.google.com/
2. Select project: **obaidani-latms**
3. Click **⚙️ Settings** (gear icon) → **Project settings**
4. Click **Service accounts** tab
5. Click **Generate new private key** button
6. Click **Generate key** (a JSON file will download)
7. Save the file as: `C:\Users\JayKay\AntiGravity\latms\service-account-key.json`

⚠️ **IMPORTANT:** This file contains sensitive credentials. Never commit it to Git!

---

### **Step 2: Set Environment Variable**

Open PowerShell in the project directory and run:

```powershell
cd C:\Users\JayKay\AntiGravity\latms
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\JayKay\AntiGravity\latms\service-account-key.json"
```

**Note:** This only sets it for the current PowerShell session.

---

### **Step 3: Update Firebase Admin Configuration**

The file `src/lib/firebase-admin.ts` needs to load the credentials.

Current code:
```typescript
admin.initializeApp({
    projectId: 'obaidani-latms',
});
```

Should be:
```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const serviceAccountPath = join(process.cwd(), 'service-account-key.json');
let serviceAccount;

try {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
    console.warn('Service account key not found, using default credentials');
}

admin.initializeApp(
    serviceAccount
        ? {
              credential: admin.credential.cert(serviceAccount),
              projectId: 'obaidani-latms',
          }
        : {
              projectId: 'obaidani-latms',
          }
);
```

**But you said no code changes!** So let's use environment variable method instead.

---

### **Step 4: Run Migration Script**

```powershell
cd C:\Users\JayKay\AntiGravity\latms
npx tsx scripts/migrate-users-to-auth.ts
```

**What the script does:**
1. Reads all users from Firestore (300 users)
2. For each user:
   - Gets Firestore document ID (e.g., `cmioeilg30006drdwcdzobsbm`)
   - Checks if Firebase Auth user exists with that UID
   - If NOT exists: Creates Firebase Auth user with UID = document ID
   - Uses password from Firestore
   - If exists: Skips (already migrated)
3. Shows summary of results

**Expected output:**
```
🚀 Starting migration of users to Firebase Auth...

📊 Found 300 users to migrate

Processing: John Doe (john@example.com)
  ✅ Created in Firebase Auth

Processing: Jane Smith (jane@example.com)
  ✅ Created in Firebase Auth

...

📊 Migration Summary:
  ✅ Successfully created: 299
  ⏭️  Skipped (already exist): 1
  ❌ Errors: 0

🎉 Migration completed successfully!
```

---

### **Step 5: Tell Employees to Log Out and Back In**

After migration, employees need to:
1. Log out completely
2. Log back in with their existing email and password
3. They will now use Firebase Auth
4. They can create tickets!

---

## 🔄 **What About Sudhan User?**

You have two options:

### **Option A: Keep Sudhan As Is** (Easiest)
- Sudhan already works
- Leave the new document with ID `TSN9e9nTMkdl3gexT7sPT7rRFvE3`
- Delete the old document `cmioeilg30006drdwcdzobsbm`
- Migrate the other 299 users
- Result: 299 users with auto-generated IDs, 1 user (Sudhan) with Firebase-generated ID

### **Option B: Reset Sudhan for Consistency** (Recommended)
1. Delete Sudhan's Firebase Auth account (`TSN9e9nTMkdl3gexT7sPT7rRFvE3`)
2. Delete the new Firestore document (`TSN9e9nTMkdl3gexT7sPT7rRFvE3`)
3. Restore the old Firestore document (`cmioeilg30006drdwcdzobsbm`)
4. Run migration - it will create Firebase Auth with UID `cmioeilg30006drdwcdzobsbm`
5. Result: All 300 users have consistent ID pattern

**I recommend Option A** (keep as is) - Sudhan already works, no need to break it!

---

## ⚠️ **Important Notes**

### **About Passwords:**
- The migration script uses the `password` field from Firestore
- If a user doesn't have a password field, it sets default: `ChangeMe123!`
- You may want to notify users to change their passwords after migration

### **About Service Account Key:**
- Add to `.gitignore`:
  ```
  service-account-key.json
  ```
- Never commit this file to Git!
- Keep it secure

### **If Migration Fails:**
- Check that service account key is in the right location
- Check that environment variable is set
- Check the error message
- You can run the script multiple times - it skips users that already exist

---

## 📊 **After Migration**

All 300 employees will be able to:
- ✅ Log in with Firebase Auth
- ✅ Create leave requests
- ✅ Create ticket requests
- ✅ No more permission errors!

---

## 🚀 **Ready to Start?**

1. Download service account key (Step 1)
2. Set environment variable (Step 2)
3. Run migration script (Step 4)
4. Test with a few users
5. Notify all employees to log out and back in

**Let me know when you're ready to proceed!**
