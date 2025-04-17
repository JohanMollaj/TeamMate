import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  async function signup(email, password, displayName) {
    try {
      setAuthError(null);
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: displayName,
        email: email,
        username: email.split('@')[0], // Default username based on email
        password: password,
        createdAt: serverTimestamp(),
        isOnline: true,
        bio: "",
        profilePicture: null
      });
      
      return userCredential;
    } catch (error) {
      setAuthError(error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      setAuthError(null);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError(error);
      throw error;
    }
  }
  
  async function logout() {
    try {
      setAuthError(null);
      return await signOut(auth);
    } catch (error) {
      setAuthError(error);
      throw error;
    }
  }
  
  function resetPassword(email) {
    setAuthError(null);
    return sendPasswordResetEmail(auth, email);
  }
  
  async function getUserProfile(uid) {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No user profile found for", uid);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // User is signed in
          console.log("User signed in:", user.uid);
          
          // Get the user profile from Firestore
          const userProfile = await getUserProfile(user.uid);
          
          // Merge Firebase auth user with Firestore profile data
          setCurrentUser({ ...user, ...userProfile });
        } else {
          // User is signed out
          console.log("User signed out");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error in auth state changed:", error);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    authError,
    signup,
    login,
    logout,
    resetPassword,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}