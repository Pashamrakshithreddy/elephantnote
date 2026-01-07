import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// 🔥 FIREBASE CONFIGURATION 🔥
// 
// TO FIX THE "auth/api-key-not-valid" ERROR:
// 1. Go to: https://console.firebase.google.com/
// 2. Select your project (or create one)
// 3. Click gear icon (⚙️) → Project settings
// 4. Scroll to "Your apps" section
// 5. Click web app icon (</>) or create new web app
// 6. Copy the config values below and replace the placeholders
//
// EXAMPLE of what it should look like:
// apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
// authDomain: "myproject-12345.firebaseapp.com",
// projectId: "myproject-12345",
// storageBucket: "myproject-12345.appspot.com",
// messagingSenderId: "123456789012",
// appId: "1:123456789012:web:abcdef1234567890"

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_ACTUAL_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_ACTUAL_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Export the app instance
export default app;