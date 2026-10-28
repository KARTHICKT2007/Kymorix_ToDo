import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyAi5jTFNpGleKeVGyHGFK2wmb0lmue3HQI",
  authDomain: "todo-6ce64.firebaseapp.com",
  projectId: "todo-6ce64",
  storageBucket: "todo-6ce64.firebasestorage.app",
  messagingSenderId: "114559145921",
  appId: "1:114559145921:web:df7614636736a9fcb00140",
  measurementId: "G-Q1DB8CF4LF"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Safe Analytics initialization (prevents crashing if blocked by ad-blocker or IndexedDB restricted)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked
  });
}
