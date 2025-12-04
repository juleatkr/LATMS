# 🔍 Diagnostic Checklist for sudhan@al-obaidani.com

## User Information
- Email: `sudhan@al-obaidani.com`
- Password: `123456`
- Status: Created in Firebase Auth manually for testing

---

## ✅ Step-by-Step Checks

### **Check 1: Firebase Authentication Console**

1. Go to: https://console.firebase.google.com/
2. Project: **obaidani-latms**
3. Navigate to: **Authentication** → **Users**
4. Find: `sudhan@al-obaidani.com`

**Record these details:**
- [ ] User exists in Firebase Auth? (YES/NO)
- [ ] Firebase Auth UID: `_________________`
- [ ] Email verified: (YES/NO)
- [ ] Account disabled: (YES/NO)

---

### **Check 2: Firestore Database Console**

1. In Firebase Console, go to: **Firestore Database**
2. Navigate to: **users** collection
3. Look for user with email: `sudhan@al-obaidani.com`

**Record these details:**
- [ ] User exists in Firestore? (YES/NO)
- [ ] Firestore Document ID: `_________________`
- [ ] Email in document: `_________________`
- [ ] Password in document: `_________________`
- [ ] Role: `_________________`

---

### **Check 3: Compare IDs** ⚠️ CRITICAL

**This is the most likely issue!**

Compare the two IDs you recorded above:
- Firebase Auth UID: `_________________`
- Firestore Document ID: `_________________`

**Do they match?**
- [ ] YES - IDs match (Good!)
- [ ] NO - IDs are different (THIS IS THE PROBLEM!)

---

## 🎯 Expected Issue

Based on your description, here's what likely happened:

1. ✅ You created employee in Firestore (database)
   - Firestore auto-generated a document ID (e.g., `abc123xyz`)
   - Password saved: `123456`

2. ✅ You created user in Firebase Auth manually
   - Firebase Auth auto-generated a UID (e.g., `def456uvw`)
   - Password set: `123456`

3. ❌ **The two IDs are DIFFERENT!**

4. When user logs in:
   - Firebase Auth succeeds ✅ (password `123456` is correct)
   - Code tries to fetch user profile from Firestore using Firebase Auth UID
   - But Firestore document has a DIFFERENT ID
   - User profile not found ❌
   - Login fails at line 38 in `src/auth.ts`

---

## 🔧 Solution (Without Changing Code)

### **Option A: Update Firestore Document ID to Match Firebase Auth UID**

**In Firestore Console:**

1. Go to Firestore Database → **users** collection
2. Find the document for `sudhan@al-obaidani.com`
3. Click on the document
4. **Copy all the field values** (email, name, role, department, password, etc.)
5. Go back to **users** collection
6. Click **Add Document**
7. For **Document ID**, paste the **Firebase Auth UID** (from Check 1)
8. Add all the fields you copied in step 4
9. Click **Save**
10. Delete the old document (with the wrong ID)

---

### **Option B: Delete and Recreate Firebase Auth User with Correct UID**

**In Firebase Auth Console:**

1. Go to Authentication → Users
2. Find `sudhan@al-obaidani.com`
3. Delete this user
4. (We'll need to use Firebase Admin SDK to create with specific UID)

**This option requires code/script, so Option A is better for now.**

---

## 📋 What to Check in Browser Console

1. Have user try to log in with:
   - Email: `sudhan@al-obaidani.com`
   - Password: `123456`

2. Open Browser Console (F12) → Console tab

3. Look for these messages:

**If IDs don't match, you'll see:**
```
✅ Firebase Auth successful: def456uvw
❌ User authenticated but profile not found in Firestore
```

**If IDs match, you'll see:**
```
✅ Firebase Auth successful: abc123xyz
✅ User profile loaded: sudhan@al-obaidani.com
```

---

## 🎯 Action Plan

**Please do this:**

1. ✅ Complete Check 1 (Firebase Auth Console)
2. ✅ Complete Check 2 (Firestore Console)
3. ✅ Complete Check 3 (Compare IDs)
4. ✅ Report back the two IDs

**If IDs don't match:**
- Follow Option A to fix the Firestore document ID

**If IDs match:**
- Check browser console for other errors
- User should be able to log in

---

## 📸 Screenshots Needed

Please provide screenshots of:
1. Firebase Auth user details (showing UID)
2. Firestore document details (showing document ID)
3. Browser console when trying to log in

This will help me see exactly what's happening!
