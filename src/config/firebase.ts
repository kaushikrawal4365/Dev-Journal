import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDWLVYY1qGfsZVUAbLINSX8tNAfTcj7jTA",
    authDomain: "dev-journal-v1.firebaseapp.com",
    projectId: "dev-journal-v1",
    storageBucket: "dev-journal-v1.firebasestorage.app",
    messagingSenderId: "570379152046",
    appId: "1:570379152046:web:c09add45a3e76685ac5b3f",
    measurementId: "G-K6Y6YZNJ48"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
