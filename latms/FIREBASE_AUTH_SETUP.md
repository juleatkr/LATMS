# Firebase Authentication Integration Guide

Your app now uses **Firebase Authentication** for secure login while storing employee data in Firestore!

## 🎯 What Changed

### Before:
- Passwords stored in plain text in Firestore ❌
- Manual password checking ❌
- No built-in security features ❌

### After:
- Passwords securely hashed by Firebase Auth ✅
- Firebase handles authentication ✅
- Employee data still in Firestore ✅
- When you create an employee, they automatically get a Firebase Auth account ✅

---

## 📋 Setup Steps

### Step 1: Enable Email/Password Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **obaidani-latms**
3. Click **Authentication** in the left sidebar
4. Click **Get Started** (if not already enabled)
5. Click **Sign-in method** tab
6. Click **Email/Password**
7. **Enable** the toggle
8. Click **Save**

### Step 2: Set Up Service Account (for Admin SDK)

The Admin SDK needs credentials to create users. You have two options:

#### Option A: For Firebase Hosting (Automatic)
If deploying to Firebase Hosting, the Admin SDK will automatically use default credentials. No setup needed!

#### Option B: For Local Development
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click the gear icon ⚙️ → **Project settings**
3. Go to **Service accounts** tab
4. Click **Generate new private key**
5. Save the JSON file securely
6. Add to your `.env.local`:
   ```
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"obaidani-latms",...}'
   ```
   (Paste the entire JSON content as a string)

### Step 3: Migrate Existing Users to Firebase Auth

Run this command to create Firebase Auth accounts for all existing users:

```bash
npx tsx scripts/migrate-users-to-auth.ts
```

This will:
- Read all users from Firestore
- Create Firebase Auth accounts for them
- Use their existing passwords
- Skip users that already have Auth accounts

### Step 4: Test the Login

1. Go to your app: https://obaidani-latms.web.app/login
2. Try logging in with:
   - **Email**: j.kottoor@al-obaidani.com
   - **Password**: 123456

---

## 🔄 How It Works Now

### Creating a New Employee

When you create an employee through the admin panel:

1. **Firebase Auth account is created** with their email and password
2. **Firestore document is created** with their profile data (name, department, role, etc.)
3. **Password is NOT stored** in Firestore anymore (only in Firebase Auth)
4. Both use the same ID (Firebase Auth UID)

### Login Process

1. User enters email and password
2. **Firebase Auth** verifies the credentials
3. If valid, the app fetches the user's **profile data from Firestore**
4. User is logged in with their role, department, etc.

### Deleting an Employee

When you delete an employee:
1. Their **Firebase Auth account is deleted**
2. Their **Firestore document is deleted**

---

## 🔐 Security Benefits

- ✅ Passwords are securely hashed (bcrypt with salt)
- ✅ Built-in rate limiting against brute force attacks
- ✅ Can add email verification later
- ✅ Can add password reset functionality
- ✅ Can add multi-factor authentication (MFA)
- ✅ Firebase handles all security best practices

---

## 🧪 Testing

### Test Creating a New Employee

1. Log in as admin
2. Go to Admin Panel → Employees
3. Click "Add Employee"
4. Fill in the form with:
   - Email: test@al-obaidani.com
   - Password: Test123!
   - Name: Test User
   - Other required fields
5. Submit

**What happens:**
- Firebase Auth account created ✅
- Firestore document created ✅
- User can immediately log in ✅

### Verify in Firebase Console

1. Go to Firebase Console → Authentication → Users
2. You should see the new user listed there!

---

## 🔄 Backward Compatibility

The system includes a **fallback** for existing users:
- If Firebase Auth login fails, it tries the old password system
- This ensures existing users can still log in during migration
- Once all users are migrated, you can remove this fallback

---

## 📝 Next Steps

1. ✅ Enable Email/Password auth in Firebase Console
2. ✅ Run the migration script
3. ✅ Test login with existing users
4. ✅ Test creating a new employee
5. ✅ Deploy the updated app: `firebase deploy`

---

## 🆘 Troubleshooting

### "Missing or insufficient permissions"
- Make sure you've set up the service account credentials
- For Firebase Hosting, this should work automatically

### "Email already exists"
- The user already has a Firebase Auth account
- This is normal if you've run the migration script before

### "User not found in Firestore"
- The user exists in Firebase Auth but not in Firestore
- Check the Firestore database for the user document

---

## 🎉 You're All Set!

Your app now has enterprise-grade authentication powered by Firebase! 🚀
