# Firebase Database Seeding Guide

Your app is now deployed at: **https://obaidani-latms.web.app**

However, the Firestore database is currently empty. Here are your options to seed the initial data:

## Option 1: Use Firebase Console (Recommended - Quick & Easy)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **obaidani-latms**
3. Navigate to **Firestore Database** in the left sidebar
4. Click **Start collection**
5. Collection ID: `users`
6. Document ID: `admin-001`
7. Add the following fields:

```
staffCode: "HR:001" (string)
email: "admin@al-obaidani.com" (string)
name: "HR Admin" (string)
password: "admin123" (string)
role: "ADMIN" (string)
department: "HR" (string)
location: "HO" (string)
ticketEligible: true (boolean)
annualLeaveBal: 30 (number)
createdAt: [Click "Add field" → Select "timestamp" → Click "Set to current time"]
updatedAt: [Click "Add field" → Select "timestamp" → Click "Set to current time"]
```

8. Click **Save**

### Admin Login Credentials
- **Email**: admin@al-obaidani.com
- **Password**: admin123

---

## Option 2: Temporarily Open Firestore Rules

If you want to run the seeding script, you need to temporarily allow public writes:

### Step 1: Update Firestore Rules
Edit `firestore.rules` and temporarily add this at the top:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY - REMOVE AFTER SEEDING
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 2: Deploy the Rules
```bash
firebase deploy --only firestore:rules
```

### Step 3: Run the Seeding Script
```bash
npx tsx scripts/seed-firebase-admin.ts
```

### Step 4: Restore Secure Rules
Revert `firestore.rules` to the original secure version and deploy again:
```bash
firebase deploy --only firestore:rules
```

---

## Option 3: Use Firebase Admin SDK (Most Secure)

This requires setting up service account credentials. Let me know if you want to go this route.

---

## Verify Seeding

After seeding, visit: **https://obaidani-latms.web.app/login**

Use the admin credentials to log in.

---

## Additional Test Users

You can also add these test users through the Firebase Console:

### Supervisor User
- Document ID: `supervisor-001`
- staffCode: "SUP:001"
- email: "supervisor@al-obaidani.com"
- name: "Ahmed Al-Balushi"
- password: "supervisor123"
- role: "SUPERVISOR"
- department: "Sales"
- location: "Muscat Branch"
- annualLeaveBal: 30
- ticketEligible: true

### HR User
- Document ID: `hr-001`
- staffCode: "HR:002"
- email: "hr@al-obaidani.com"
- name: "HR Manager"
- password: "hr123"
- role: "HR"
- department: "HR"
- location: "HO"
- annualLeaveBal: 30
- ticketEligible: true

### Employee User
- Document ID: `employee-001`
- staffCode: "EC:6143"
- email: "employee@al-obaidani.com"
- name: "Jay Kay"
- password: "user123"
- role: "EMPLOYEE"
- department: "Sales"
- location: "Muscat Branch"
- annualLeaveBal: 24
- ticketEligible: true
- supervisorId: "supervisor-001"
