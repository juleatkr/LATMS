# 🔐 Password Management After Migration

## ⚠️ IMPORTANT: Passwords Are Stored in TWO Places

After the migration, user passwords exist in:

```
1. Firebase Authentication (Primary - used for login)
2. Firestore (Legacy - kept for backward compatibility)
```

---

## ❌ Current Problem

Your current code **ONLY updates Firestore**, not Firebase Auth!

**File:** `src/lib/firebase-service.ts` → `updateUser()` method

```typescript
async updateUser(id: string, data: any) {
    const ref = doc(db, 'users', id);
    const updateData = {
        ...data,
        updatedAt: Timestamp.now()
    };
    await updateDoc(ref, updateData);  // ❌ Only updates Firestore!
    return { id, ...updateData };
}
```

**Result:** If admin changes password, user can't log in!

---

## ✅ Solution: Update BOTH Places

### **Option 1: Update `firebaseService.updateUser()` Method** (Recommended)

Modify the method to update Firebase Auth when password changes:

```typescript
async updateUser(id: string, data: any) {
    // Update Firestore
    const ref = doc(db, 'users', id);
    const updateData = {
        ...data,
        updatedAt: Timestamp.now()
    };
    await updateDoc(ref, updateData);

    // If password is being updated, also update Firebase Auth
    if (data.password) {
        try {
            const { adminAuth } = await import('./firebase-admin');
            await adminAuth.updateUser(id, {
                password: data.password
            });
            console.log('✅ Password updated in Firebase Auth');
        } catch (error) {
            console.error('❌ Failed to update Firebase Auth password:', error);
            // You might want to throw error here to rollback Firestore update
        }
    }

    return { id, ...updateData };
}
```

---

### **Option 2: Create Separate Password Update Method**

Add a new method specifically for password updates:

```typescript
async updateUserPassword(userId: string, newPassword: string) {
    try {
        // Update Firebase Auth (primary)
        const { adminAuth } = await import('./firebase-admin');
        await adminAuth.updateUser(userId, {
            password: newPassword
        });

        // Update Firestore (for backward compatibility)
        const ref = doc(db, 'users', userId);
        await updateDoc(ref, {
            password: newPassword,
            updatedAt: Timestamp.now()
        });

        console.log('✅ Password updated in both Firebase Auth and Firestore');
        return { success: true };
    } catch (error) {
        console.error('❌ Password update failed:', error);
        throw error;
    }
}
```

Then use it in your API route:

```typescript
// In admin/employees/[id]/route.ts
if (password) {
    await firebaseService.updateUserPassword(id, password);
    // Don't include password in updateData
    delete updateData.password;
}
```

---

## 🎯 My Recommendation

**Use Option 1** - Update the `updateUser()` method to handle password sync automatically.

This ensures:
- ✅ Any password change updates both places
- ✅ No need to remember to call separate methods
- ✅ Consistent behavior everywhere
- ✅ Backward compatible

---

## 📋 Implementation Steps

1. **Update `src/lib/firebase-service.ts`**
   - Modify `updateUser()` method to sync passwords

2. **Test password change**
   - Change a user's password from admin panel
   - Verify user can log in with new password
   - Check browser console for success message

3. **Optional: Remove Firestore password field**
   - After all users are migrated and tested
   - You can stop storing passwords in Firestore
   - Only use Firebase Auth (more secure!)

---

## ⚠️ Important Notes

### **About Security:**

Currently passwords are stored in **plain text** in Firestore! ⚠️

After migration is stable, you should:
1. Stop storing passwords in Firestore
2. Only use Firebase Auth (passwords are hashed)
3. Remove password field from Firestore documents

### **About Employee Creation:**

When creating NEW employees, you should also create Firebase Auth account:

```typescript
async createUser(data: any) {
    // 1. Create Firebase Auth user FIRST
    const { adminAuth } = await import('./firebase-admin');
    const authUser = await adminAuth.createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
    });

    // 2. Create Firestore document with same UID
    const id = authUser.uid;
    const ref = doc(db, 'users', id);
    await setDoc(ref, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    });

    return { id, ...data };
}
```

---

## 🚀 Next Steps

Would you like me to:

**A)** Update the `updateUser()` method to sync passwords automatically?

**B)** Create a separate password update method?

**C)** Update the employee creation code to create Firebase Auth users?

**D)** All of the above?

Let me know! 🔧
