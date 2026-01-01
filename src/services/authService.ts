import { signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../config/firebase";
import type { User } from "../types";

export const authService = {
    async loginWithGoogle(): Promise<User> {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const fbUser = result.user;

            const user: User = {
                uid: fbUser.uid,
                displayName: fbUser.displayName,
                email: fbUser.email,
                photoURL: fbUser.photoURL,
                lastLoginAt: Date.now(),
            };

            // Log user to Firestore (simulating the "sheet" requirement)
            await this.logUserToFirestore(user);

            return user;
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    },

    async logout(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
            throw error;
        }
    },

    async logUserToFirestore(user: User): Promise<void> {
        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                lastLogin: serverTimestamp(), // Server-side timestamp for accuracy
                photoURL: user.photoURL,
                clientTimestamp: user.lastLoginAt
            }, { merge: true }); // Merge to update lastLogin without overwriting other future fields
        } catch (error) {
            console.error("Firestore Logging Error:", error);
            // We don't throw here to avoid blocking the login flow if firestore fails temporarily
        }
    }
};
