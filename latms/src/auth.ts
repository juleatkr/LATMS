import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { firebaseService } from "@/lib/firebase-service"
import { z } from "zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET || "7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    trustHost: true,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    try {
                        // Step 1: Authenticate with Firebase Auth
                        const { signInWithEmailAndPassword } = await import('firebase/auth');
                        const { auth: firebaseAuth } = await import('@/lib/firebase');

                        const userCredential = await signInWithEmailAndPassword(
                            firebaseAuth,
                            email,
                            password
                        );

                        console.log('✅ Firebase Auth successful:', userCredential.user.uid);

                        // Step 2: Fetch user profile data from Firestore
                        const user = await firebaseService.getUser(userCredential.user.uid);

                        if (!user) {
                            console.error('❌ User authenticated but profile not found in Firestore');
                            return null;
                        }

                        console.log('✅ User profile loaded:', user.email);
                        return user;

                    } catch (error: any) {
                        console.error('❌ Authentication failed:', error.code);

                        // Fallback: Check if user exists with old password system
                        // This allows existing users to still log in
                        const user = await firebaseService.getUserByEmail(email);
                        if (user && user.password === password) {
                            console.log('⚠️ Using legacy password authentication');
                            return user;
                        }

                        return null;
                    }
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
    },
})
