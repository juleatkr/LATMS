# Firebase Integration Guide - LATMS

## 🔥 Firebase Setup Complete!

Your LATMS application is now connected to Firebase project: **obaidani-latms**

---

## 📦 What's Been Added

### 1. **Firebase SDK** (Installed)
- `firebase` package installed
- Firestore, Auth, and Analytics ready to use

### 2. **Configuration Files**
- `src/lib/firebase.ts` - Firebase initialization
- `.firebaserc` - Project configuration
- `firebase.json` - Hosting configuration
- `src/hooks/useFirebase.ts` - Custom React hooks

---

## 🚀 How to Use Firebase in Your App

### **Option 1: Use Firestore for New Features**

You can use Firebase Firestore alongside your existing SQLite database:

```typescript
// In any component
"use client";

import { useFirestore } from '@/hooks/useFirebase';

export default function MyComponent() {
  const { addDocument, getDocuments } = useFirestore();

  const saveToFirebase = async () => {
    // Add a document
    const id = await addDocument('notifications', {
      message: 'Leave request approved',
      userId: 'user123',
      read: false
    });
    
    console.log('Document created with ID:', id);
  };

  const fetchNotifications = async () => {
    // Get all documents
    const notifications = await getDocuments('notifications');
    console.log(notifications);
  };

  return (
    <div>
      <button onClick={saveToFirebase}>Save Notification</button>
      <button onClick={fetchNotifications}>Get Notifications</button>
    </div>
  );
}
```

### **Option 2: Use Firebase Auth**

```typescript
import { useFirebaseAuth } from '@/hooks/useFirebase';

export default function Profile() {
  const { user, loading } = useFirebaseAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
```

---

## 🎯 Suggested Use Cases

### **Keep Using SQLite For:**
- ✅ User management
- ✅ Leave requests
- ✅ Ticket management
- ✅ Core business logic

### **Use Firebase For:**
- 🔔 **Real-time notifications**
- 💬 **Chat/messaging features**
- 📊 **Analytics tracking**
- 📁 **File uploads** (Firebase Storage)
- 🔐 **Additional authentication** (Google, Email, etc.)

---

## 📱 Firebase Services Available

### **1. Firestore (NoSQL Database)**
```typescript
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Add a notification
await addDoc(collection(db, 'notifications'), {
  userId: 'user123',
  message: 'Your leave was approved',
  timestamp: new Date()
});
```

### **2. Authentication**
```typescript
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Sign in a user
await signInWithEmailAndPassword(auth, email, password);
```

### **3. Analytics**
```typescript
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

// Track an event
if (analytics) {
  logEvent(analytics, 'leave_request_submitted', {
    userId: 'user123',
    leaveType: 'Annual'
  });
}
```

---

## 🌐 Deploying to Firebase Hosting

### **Prerequisites:**
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

### **Deploy Steps:**

**⚠️ Important:** Firebase Hosting only supports **static exports**. Your current app uses API routes and SSR, which won't work on Firebase Hosting alone.

**For Static Export (Limited Functionality):**
```bash
# 1. Update next.config.ts to enable static export
# Add: output: 'export'

# 2. Build the static site
npm run build

# 3. Deploy to Firebase
firebase deploy --only hosting
```

**For Full Functionality:**
You'll need to use **Firebase Cloud Functions** or migrate to **Vercel/Railway** (as discussed earlier).

---

## 🔧 Current Setup

### **Database:**
- **Primary:** SQLite (Prisma) - All current data
- **Secondary:** Firebase Firestore - Available for new features

### **Authentication:**
- **Primary:** NextAuth.js - Current login system
- **Secondary:** Firebase Auth - Available as backup/alternative

### **Hosting:**
- **Current:** Local development (`npm run dev`)
- **Firebase:** Configured but requires static export

---

## 💡 Next Steps (Optional)

### **If you want to use Firebase more extensively:**

1. **Add Real-time Notifications:**
   - Use Firestore to store notifications
   - Listen for real-time updates
   - Show toast notifications to users

2. **Track Analytics:**
   - Log user actions (leave submissions, approvals)
   - Monitor app usage
   - View reports in Firebase Console

3. **Add File Uploads:**
   - Use Firebase Storage for documents
   - Store leave certificates, tickets, etc.

4. **Enable Push Notifications:**
   - Use Firebase Cloud Messaging (FCM)
   - Send mobile/browser notifications

---

## 🔗 Useful Links

- **Firebase Console:** https://console.firebase.google.com/project/obaidani-latms
- **Firestore Database:** https://console.firebase.google.com/project/obaidani-latms/firestore
- **Analytics:** https://console.firebase.google.com/project/obaidani-latms/analytics
- **Firebase Docs:** https://firebase.google.com/docs

---

## ⚠️ Important Notes

1. **Your current app still uses SQLite** - Firebase is an addition, not a replacement
2. **API routes won't work on Firebase Hosting** - You need Cloud Functions or another platform
3. **Firebase is best used for supplementary features** - Keep core logic in SQLite/Prisma for now
4. **Free tier limits:**
   - Firestore: 1GB storage, 50K reads/day
   - Auth: Unlimited users
   - Hosting: 10GB storage, 360MB/day bandwidth

---

## 🎉 You're All Set!

Firebase is now integrated and ready to use. You can:
- Continue using your existing SQLite database
- Add Firebase features incrementally
- Deploy static pages to Firebase Hosting (with limitations)

**Need help?** Check the Firebase Console or the code examples above!
