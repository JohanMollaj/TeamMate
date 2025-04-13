// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Replace with your own Firebase config object
const firebaseConfig = {
    apiKey: "AIzaSyCKVtLpvZ2hstPE1VWgvGegnvsH_WK_UYg",
    authDomain: "teammate-fb933.firebaseapp.com",
    projectId: "teammate-fb933",
    storageBucket: "teammate-fb933.firebasestorage.app",
    messagingSenderId: "399323349672",
    appId: "1:399323349672:web:f1c1442c6991af2fb5789d",
    measurementId: "G-9EFMNW1VNC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };