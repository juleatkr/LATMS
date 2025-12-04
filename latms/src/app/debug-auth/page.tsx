'use client';

import { useEffect, useState } from 'react';
import { auth as firebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function DebugAuthPage() {
    const [sessionData, setSessionData] = useState<any>(null);
    const [firebaseAuthData, setFirebaseAuthData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check NextAuth session
        fetch('/api/auth/session')
            .then(r => r.json())
            .then(data => {
                console.log('NextAuth Session:', data);
                setSessionData(data);
            })
            .catch(err => console.error('Session error:', err));

        // Check Firebase Auth state
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            console.log('Firebase Auth User:', user);
            if (user) {
                setFirebaseAuthData({
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    displayName: user.displayName,
                });
            } else {
                setFirebaseAuthData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="p-8">Loading authentication status...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">🔍 Authentication Debug Page</h1>

            <div className="space-y-6">
                {/* NextAuth Session */}
                <div className="border rounded-lg p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
                    {sessionData?.user ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">✅</span>
                                <span className="font-semibold text-green-600">Logged In</span>
                            </div>
                            <pre className="bg-white p-4 rounded border overflow-auto">
                                {JSON.stringify(sessionData, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">❌</span>
                            <span className="font-semibold text-red-600">Not Logged In</span>
                        </div>
                    )}
                </div>

                {/* Firebase Auth State */}
                <div className="border rounded-lg p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4">Firebase Authentication</h2>
                    {firebaseAuthData ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">✅</span>
                                <span className="font-semibold text-green-600">Firebase Auth Active</span>
                            </div>
                            <pre className="bg-white p-4 rounded border overflow-auto">
                                {JSON.stringify(firebaseAuthData, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">⚠️</span>
                                <span className="font-semibold text-orange-600">No Firebase Auth Session</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                User is logged in with NextAuth but NOT with Firebase Auth.
                                This means they're using legacy password authentication.
                            </p>
                        </div>
                    )}
                </div>

                {/* Diagnosis */}
                <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
                    <h2 className="text-xl font-semibold mb-4">🎯 Diagnosis</h2>
                    {sessionData?.user && firebaseAuthData ? (
                        <div className="space-y-2">
                            <p className="text-green-700 font-semibold">✅ Everything looks good!</p>
                            <p className="text-sm">User is authenticated with both NextAuth and Firebase Auth.</p>
                            {sessionData.user.id !== firebaseAuthData.uid && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                                    <p className="text-red-700 font-semibold">⚠️ WARNING: ID Mismatch!</p>
                                    <p className="text-sm mt-2">
                                        NextAuth ID: <code>{sessionData.user.id}</code><br />
                                        Firebase UID: <code>{firebaseAuthData.uid}</code>
                                    </p>
                                    <p className="text-sm mt-2">
                                        The Firestore document ID must match the Firebase Auth UID.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : sessionData?.user && !firebaseAuthData ? (
                        <div className="space-y-2">
                            <p className="text-orange-700 font-semibold">⚠️ Using Legacy Authentication</p>
                            <p className="text-sm">User is logged in with NextAuth but not Firebase Auth.</p>
                            <p className="text-sm mt-2 font-semibold">This is the problem!</p>
                            <div className="mt-4 p-4 bg-white rounded border">
                                <p className="font-semibold mb-2">Solution:</p>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                    <li>User must log out completely</li>
                                    <li>User must log back in (this will trigger Firebase Auth)</li>
                                    <li>If still fails, password may need to be reset in Firebase Console</li>
                                </ol>
                            </div>
                        </div>
                    ) : (
                        <p className="text-red-700 font-semibold">❌ Not logged in</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="border rounded-lg p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            🔄 Refresh Page
                        </button>
                        <button
                            onClick={() => {
                                fetch('/api/auth/signout', { method: 'POST' })
                                    .then(() => window.location.href = '/login');
                            }}
                            className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            🚪 Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
