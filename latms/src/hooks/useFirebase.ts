"use client";

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    QueryConstraint,
    DocumentData,
    getDoc
} from 'firebase/firestore';

/**
 * Custom hook for Firebase Firestore operations
 * This provides a simple interface to interact with Firebase
 * while keeping your existing Prisma/SQLite setup intact
 */
export function useFirestore<T = DocumentData>() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Add a document to a collection
    const addDocument = async (collectionName: string, data: Partial<T>): Promise<string> => {
        setLoading(true);
        setError(null);
        try {
            const docRef = await addDoc(collection(db, collectionName), {
                ...data,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            setLoading(false);
            return docRef.id;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    // Get all documents from a collection
    const getDocuments = async (
        collectionName: string,
        conditions?: QueryConstraint[]
    ): Promise<(T & { id: string })[]> => {
        setLoading(true);
        setError(null);
        try {
            let q = query(collection(db, collectionName));

            if (conditions && conditions.length > 0) {
                q = query(collection(db, collectionName), ...conditions);
            }

            const querySnapshot = await getDocs(q);
            const documents = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...(data || {})
                } as T & { id: string };
            });
            setLoading(false);
            return documents;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    // Get a single document by ID
    const getDocument = async (collectionName: string, docId: string): Promise<(T & { id: string }) | null> => {
        setLoading(true);
        setError(null);
        try {
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setLoading(false);
                return {
                    id: docSnap.id,
                    ...(data || {})
                } as T & { id: string };
            }

            setLoading(false);
            return null;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    // Update a document
    const updateDocument = async (
        collectionName: string,
        docId: string,
        data: Partial<T>
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const docRef = doc(db, collectionName, docId);
            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now()
            } as any);
            setLoading(false);
            return true;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    // Delete a document
    const deleteDocument = async (collectionName: string, docId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await deleteDoc(doc(db, collectionName, docId));
            setLoading(false);
            return true;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    return {
        loading,
        error,
        addDocument,
        getDocument,
        getDocuments,
        updateDocument,
        deleteDocument
    };
}

/**
 * Custom hook for Firebase Authentication
 */
export function useFirebaseAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}
