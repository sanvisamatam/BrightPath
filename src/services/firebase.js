// Firebase & Fallback Service Layer
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// Environment variable check for Firebase credentials
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || ""
};

let app = null;
let auth = null;
let db = null;
let isFirebaseConfigured = false;

// Check if valid Firebase configuration exists
if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log("BrightMinds: Firebase initialized successfully.");
  } catch (err) {
    console.warn("BrightMinds: Firebase initialization failed, switching to Local storage mode.", err);
  }
} else {
  console.info("BrightMinds: Firebase credentials not set. Running in Local Storage Mode.");
}

export { app, auth, db, isFirebaseConfigured };
