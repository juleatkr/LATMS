/**
 * Firebase Service
 * Handles all database operations using Firebase Firestore.
 * Replaces Prisma for a full cloud-native backend.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    DocumentData,
    QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { FirebaseConverters, FirebaseLeaveRequest, FirebaseTicketRequest, FirebaseUser } from '@/types/firebase';

class FirebaseService {
    // ==========================================
    // USERS
    // ==========================================

    async getUser(userId: string) {
        try {
            const { adminDb } = await import('./firebase-admin');
            const doc = await adminDb.collection('users').doc(userId).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() } as FirebaseUser;
        } catch (error) {
            console.error('Error in getUser (Admin SDK):', error);
            return null;
        }
    }

    async getUserByEmail(email: string) {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as FirebaseUser;
    }

    async getSubordinates(supervisorId: string) {
        const q = query(collection(db, 'users'), where('supervisorId', '==', supervisorId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseUser));
    }

    async getAllUsers() {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseUser));

        // Create a map for quick supervisor lookup
        const userMap = new Map(users.map(u => [u.id, u]));

        // Attach supervisor details
        return users.map(user => {
            const supervisor = user.supervisorId ? userMap.get(user.supervisorId) : null;
            return {
                ...user,
                supervisor: supervisor ? {
                    staffCode: supervisor.staffCode,
                    name: supervisor.name
                } : null
            };
        });
    }

    async checkUserExists(staffCode: string, email: string) {
        const q1 = query(collection(db, 'users'), where('staffCode', '==', staffCode));
        const q2 = query(collection(db, 'users'), where('email', '==', email));

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        return !snap1.empty || !snap2.empty;
    }

    async getEmployees(excludeUserId?: string) {
        const q = query(collection(db, 'users'), where('role', '==', 'EMPLOYEE'));
        const snapshot = await getDocs(q);
        const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseUser));

        if (excludeUserId) {
            return employees.filter(e => e.id !== excludeUserId);
        }
        return employees;
    }

    async createUser(data: any) {
        try {
            // Import admin SDK dynamically (only on server)
            const { adminAuth } = await import('./firebase-admin');

            // Step 1: Create Firebase Auth user
            const authUser = await adminAuth.createUser({
                email: data.email,
                password: data.password, // Firebase Auth will hash this automatically
                displayName: data.name,
                disabled: false,
            });

            console.log('✅ Created Firebase Auth user:', authUser.uid);

            // Step 2: Create Firestore user document using the Auth UID
            const ref = doc(db, 'users', authUser.uid);

            const firebaseData = {
                ...data,
                // Don't store plain password in Firestore anymore
                password: undefined, // Remove password from Firestore
                authUid: authUser.uid, // Store the Firebase Auth UID
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            // Remove undefined fields
            Object.keys(firebaseData).forEach(key =>
                firebaseData[key] === undefined && delete firebaseData[key]
            );

            await setDoc(ref, firebaseData);

            console.log('✅ Created Firestore user document:', authUser.uid);

            return { id: authUser.uid, ...firebaseData };
        } catch (error: any) {
            console.error('❌ Error creating user:', error);

            // If it's an auth error, provide more context
            if (error.code === 'auth/email-already-exists') {
                throw new Error('A user with this email already exists');
            }

            throw error;
        }
    }

    async updateUser(id: string, data: any) {
        const ref = doc(db, 'users', id);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now()
        };
        await updateDoc(ref, updateData);

        // If password is being updated, also update Firebase Auth
        if (data.password) {
            try {
                // Import admin SDK dynamically (only on server)
                const { adminAuth } = await import('./firebase-admin');
                await adminAuth.updateUser(id, {
                    password: data.password
                });
                console.log('✅ Password updated in Firebase Auth for user:', id);
            } catch (error) {
                console.error('❌ Failed to update Firebase Auth password:', error);
                // Note: We log the error but don't throw, so the Firestore update remains valid.
                // In a strict consistency model, you might want to revert the Firestore change.
            }
        }

        return { id, ...updateData };
    }

    async deleteUser(id: string) {
        try {
            // Import admin SDK dynamically (only on server)
            const { adminAuth } = await import('./firebase-admin');

            // Step 1: Delete from Firebase Auth
            await adminAuth.deleteUser(id);
            console.log('✅ Deleted Firebase Auth user:', id);

            // Step 2: Delete from Firestore
            const ref = doc(db, 'users', id);
            await deleteDoc(ref);
            console.log('✅ Deleted Firestore user document:', id);

            return true;
        } catch (error: any) {
            console.error('❌ Error deleting user:', error);

            // If user doesn't exist in Auth, still try to delete from Firestore
            if (error.code === 'auth/user-not-found') {
                const ref = doc(db, 'users', id);
                await deleteDoc(ref);
                console.log('⚠️ User not in Auth, but deleted from Firestore:', id);
                return true;
            }

            throw error;
        }
    }

    // ==========================================
    // LEAVE REQUESTS
    // ==========================================

    async createLeaveRequest(data: any) {
        const { adminDb, default: admin } = await import('./firebase-admin');

        // Generate a new ID if not provided
        const id = data.id || adminDb.collection('leaveRequests').doc().id;

        // Convert to Firebase format (handling dates, etc.)
        const firebaseData = {
            ...data,
            startDate: admin.firestore.Timestamp.fromDate(new Date(data.startDate)),
            endDate: admin.firestore.Timestamp.fromDate(new Date(data.endDate)),
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };

        await adminDb.collection('leaveRequests').doc(id).set(firebaseData);

        return {
            id,
            ...firebaseData,
            startDate: firebaseData.startDate.toDate(),
            endDate: firebaseData.endDate.toDate(),
            createdAt: firebaseData.createdAt.toDate(),
            updatedAt: firebaseData.updatedAt.toDate()
        };
    }

    async getLeaveRequests(filters: {
        userId?: string;
        status?: string;
        type?: string;
        fromDate?: Date;
        toDate?: Date;
        userRole?: string; // 'ADMIN', 'HR', 'SUPERVISOR', 'EMPLOYEE'
        currentUserId?: string; // Needed for supervisor logic
    }) {
        let constraints: QueryConstraint[] = [];
        const leaveCollection = collection(db, 'leaveRequests');

        // Role-based filtering logic
        if (filters.userRole === 'ADMIN' || filters.userRole === 'HR' || filters.userRole === 'ACCOUNTS') {
            // Can view all, apply specific filters if present
            if (filters.userId) constraints.push(where('userId', '==', filters.userId));
        } else if (filters.userRole === 'SUPERVISOR' && filters.currentUserId) {
            // Complex logic: Own requests OR Subordinates OR Submitted by me
            // Firestore OR queries are limited. We might need to fetch and filter in memory 
            // or make multiple queries. For simplicity in this migration, we'll fetch relevant 
            // subsets or rely on client-side filtering if the dataset is small.
            // A common pattern is to store "supervisorId" on the leave request itself (denormalization).

            // For now, let's implement the basic "My Requests" filter if userId is passed
            if (filters.userId) {
                constraints.push(where('userId', '==', filters.userId));
            }
            // Note: Full supervisor logic often requires a dedicated field like `supervisors: [id]` on the doc
        } else {
            // Regular employee - only see own
            if (filters.currentUserId) {
                constraints.push(where('userId', '==', filters.currentUserId));
            }
        }

        // Apply other filters
        if (filters.status && filters.status !== 'All') {
            constraints.push(where('status', '==', filters.status));
        }
        if (filters.type && filters.type !== 'All') {
            constraints.push(where('type', '==', filters.type));
        }
        if (filters.fromDate) {
            constraints.push(where('startDate', '>=', Timestamp.fromDate(filters.fromDate)));
        }
        if (filters.toDate) {
            constraints.push(where('endDate', '<=', Timestamp.fromDate(filters.toDate)));
        }

        // Add sorting
        constraints.push(orderBy('createdAt', 'desc'));

        const q = query(leaveCollection, ...constraints);
        const snapshot = await getDocs(q);

        // Transform and fetch related data (Joins)
        const requests = await Promise.all(snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data() as FirebaseLeaveRequest;

            // We need to fetch the ticket request associated with this leave
            // This is a "Join" operation
            const ticketQ = query(collection(db, 'ticketRequests'), where('leaveRequestId', '==', docSnap.id));
            const ticketSnap = await getDocs(ticketQ);
            const ticketRequest = ticketSnap.empty ? null : { id: ticketSnap.docs[0].id, ...ticketSnap.docs[0].data() };

            // We might also need user details if not fully denormalized
            // But our migration script added userName, userEmail, etc. to the leave doc!
            // So we can just return the data.

            return {
                ...data,
                id: docSnap.id,
                // Convert Timestamps to Dates for the frontend
                startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
                endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,

                // Construct the "user" object that the frontend expects
                user: {
                    // @ts-ignore - these fields were added by migration
                    name: data.userName || 'Unknown',
                    // @ts-ignore
                    email: data.userEmail || '',
                    // @ts-ignore
                    department: data.userDepartment || ''
                },
                ticketRequest
            };
        }));

        // If we are a supervisor and didn't filter by userId, we might need to filter manually here
        // to include subordinates. This is a trade-off of NoSQL.
        if (filters.userRole === 'SUPERVISOR' && !filters.userId && filters.currentUserId) {
            // Fetch subordinates IDs
            const subordinates = await this.getSubordinates(filters.currentUserId);
            const subIds = subordinates.map(s => s.id);
            const myId = filters.currentUserId;

            return requests.filter(r =>
                r.userId === myId ||
                subIds.includes(r.userId) ||
                r.submittedById === myId
            );
        }

        return requests;
    }

    async getLeaveRequest(id: string) {
        const docRef = doc(db, 'leaveRequests', id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;

        const data = snapshot.data() as FirebaseLeaveRequest;

        // Fetch related ticket request if needed (omitted for now as usually not needed for simple status update)

        return {
            ...data,
            id: snapshot.id,
            startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
            endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            // ... other timestamps if needed
        };
    }

    async updateLeaveRequest(id: string, data: any) {
        const ref = doc(db, 'leaveRequests', id);

        // Convert any Date objects in data to Timestamps
        const updateData: any = { ...data };
        for (const key in updateData) {
            if (updateData[key] instanceof Date) {
                updateData[key] = Timestamp.fromDate(updateData[key]);
            }
        }

        updateData.updatedAt = Timestamp.now();

        await updateDoc(ref, updateData);
        return { id, ...updateData };
    }

    // ==========================================
    // TICKET REQUESTS
    // ==========================================

    async createTicketRequest(data: any) {
        const { adminDb, default: admin } = await import('./firebase-admin');

        const id = data.id || adminDb.collection('ticketRequests').doc().id;

        const firebaseData = {
            ...data,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };

        await adminDb.collection('ticketRequests').doc(id).set(firebaseData);

        return {
            id,
            ...firebaseData,
            createdAt: firebaseData.createdAt.toDate(),
            updatedAt: firebaseData.updatedAt.toDate()
        };
    }

    async getTicketRequests() {
        const q = query(collection(db, 'ticketRequests'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
                // Map denormalized fields to nested objects if frontend expects them
                leaveRequest: {
                    user: {
                        // @ts-ignore
                        name: data.userName,
                        // @ts-ignore
                        email: data.userEmail,
                        // @ts-ignore
                        department: data.userDepartment
                    },
                    // @ts-ignore
                    status: data.leaveStatus
                }
            };
        });
    }

    async updateTicketRequest(id: string, data: any) {
        const ref = doc(db, 'ticketRequests', id);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now()
        };
        await updateDoc(ref, updateData);
        return { id, ...updateData };
    }
}

export const firebaseService = new FirebaseService();
