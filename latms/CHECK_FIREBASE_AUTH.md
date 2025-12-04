# Firebase Authentication Diagnostic Guide

## Issue: User `sudhan@al-obaidani.com` Cannot Submit Tickets

The problem is likely that the user exists in **Firestore** but NOT in **Firebase Authentication**.

---

## Step 1: Check Firebase Authentication Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **obaidani-latms**
3. Navigate to **Authentication** → **Users**
4. Search for: `sudhan@al-obaidani.com`

### Expected Results:
- ✅ **If user EXISTS**: User should have a UID and be listed
- ❌ **If user DOES NOT EXIST**: This is the problem!

---

## Step 2: Check Firestore Users Collection

1. In Firebase Console, go to **Firestore Database**
2. Navigate to the `users` collection
3. Search for the user with email: `sudhan@al-obaidani.com`

### What to Check:
- Does the user document exist in Firestore?
- What is the document ID (this should match the Firebase Auth UID)?
- Does the user have a `role` field?

---

## Step 3: Verify Authentication Flow

Check how users are currently logging in:

### A. Check the Auth Configuration
File: `src/auth.ts`

Look for:
- Is it using Firebase Auth or custom credentials?
- Is there a sync between Firestore users and Firebase Auth users?

### B. Check the Login API
File: `src/app/api/auth/[...nextauth]/route.ts` (or similar)

Verify:
- Does login create a Firebase Auth session?
- Does it set the proper auth token?

---

## Step 4: Check Current Session

When logged in as `sudhan@al-obaidani.com`, check the browser console:

```javascript
// Run this in browser console
console.log('Session:', await fetch('/api/auth/session').then(r => r.json()));
```

Look for:
- Is there a valid session?
- Does it have a Firebase Auth UID?

---

## Step 5: Verify Firebase Admin SDK Configuration

File: `src/lib/firebase-admin.ts`

Check:
- Is Firebase Admin SDK properly initialized?
- Are service account credentials loaded?
- Can it create users in Firebase Auth?

---

## Quick Fix Options

### Option A: Migrate User to Firebase Auth (Recommended)

Run the migration script to create Firebase Auth accounts for all Firestore users:

```bash
npm run migrate:firebase
```

Or create a specific script for this user.

### Option B: Create User Manually in Firebase Auth

1. Go to Firebase Console → Authentication → Users
2. Click "Add User"
3. Email: `sudhan@al-obaidani.com`
4. Password: (set a temporary password)
5. Copy the generated UID
6. Update the Firestore user document ID to match this UID

### Option C: Temporary - Allow Unauthenticated Access (NOT RECOMMENDED)

Temporarily modify `firestore.rules` to allow creation without auth (for testing only):

```javascript
allow create: if true; // TEMPORARY - REMOVE AFTER TESTING
```

---

## Next Steps

Please check:
1. ✅ Does `sudhan@al-obaidani.com` exist in Firebase Authentication?
2. ✅ Does the Firestore document ID match the Firebase Auth UID?
3. ✅ Is the user properly logged in with a Firebase Auth session?

Report back with your findings!
