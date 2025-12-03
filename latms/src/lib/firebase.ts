// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQNpmvJcFpiEFm8Elag3oz5BW66q_TWLU",
    authDomain: "obaidani-latms.firebaseapp.com",
    projectId: "obaidani-latms",
    storageBucket: "obaidani-latms.firebasestorage.app",
    messagingSenderId: "958600713226",
    appId: "1:958600713226:web:04e96ab438da494ac9fbf3",
    measurementId: "G-GKZHVY1D5K"
};

// Initialize Firebase (singleton pattern to avoid re-initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, auth, analytics };
