import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Temporarily disable Firebase initialization for development
let app: any = null;
let auth: any = null;

// Only initialize Firebase if all required environment variables are present
if (import.meta.env.VITE_FIREBASE_API_KEY && 
    import.meta.env.VITE_FIREBASE_PROJECT_ID && 
    import.meta.env.VITE_FIREBASE_APP_ID) {
  
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };
export default app;
