import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Export RecaptchaVerifier for phone authentication
export { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDfYotGN2jmGOqhBOdJNB9DUFHybZt5Esk",
    authDomain: "medicare-e5101.firebaseapp.com",
    projectId: "medicare-e5101",
    storageBucket: "medicare-e5101.firebasestorage.app",
    messagingSenderId: "330939871425",
    appId: "1:330939871425:web:d90344b5c0167e50bee440",
    measurementId: "G-Z2C3C8DRV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export { analytics };
export default app;
