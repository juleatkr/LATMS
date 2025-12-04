# Quick Setup Instructions

## Step 1: Enable Email/Password Authentication ✅

You should see the Firebase Console open. Follow these steps:

1. Find **"Email/Password"** in the Native providers section
2. Click on it
3. Toggle **"Enable"** to ON
4. Click **"Save"**

---

## Step 2: Get Service Account Key

We need this to run the migration script locally.

### Option A: Download Service Account Key

1. In Firebase Console, click the **gear icon ⚙️** (top left) → **Project settings**
2. Go to **Service accounts** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** in the popup
5. A JSON file will download

### Option B: Use Application Default Credentials (Easier)

Run this command to authenticate:
```bash
firebase login
```

Then run:
```bash
gcloud auth application-default login
```

---

## Step 3: Run Migration Script

Once Email/Password is enabled, run:

```bash
npx tsx scripts/migrate-users-to-auth.ts
```

This will create Firebase Auth accounts for all your existing users!

---

## Step 4: Deploy

After migration is complete:

```bash
firebase deploy
```

---

**Let me know when you've enabled Email/Password authentication and I'll help you run the migration!**
