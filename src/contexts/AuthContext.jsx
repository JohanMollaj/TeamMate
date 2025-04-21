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
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  async function signup(email, password, username) {
    try {
      setAuthError(null);
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username as displayName
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: username,
        email: email,
        username: username,
        password: password, // Note: In a production app, never store raw passwords
        createdAt: serverTimestamp(),
        isOnline: true,
        bio: "",
        profilePicture: null,
        friends: [], // Initialize with empty friends array
        incomingFriendRequests: [], // Initialize empty friend requests arrays
        outgoingFriendRequests: []
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update the user's online status
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await updateDoc(userDocRef, {
        isOnline: true,
        lastLoginAt: serverTimestamp()
      });
      
      return userCredential;
    } catch (error) {
      setAuthError(error);
      throw error;
    }
  }
  
  async function logout() {
    try {
      setAuthError(null);
      
      // Set user as offline before signing out
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          isOnline: false,
          lastOnlineAt: serverTimestamp()
        });
      }
      
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
          
          // Update online status in Firestore if we have a user profile
          if (userProfile) {
            const userDocRef = doc(db, "users", user.uid);
            updateDoc(userDocRef, {
              isOnline: true,
              lastActivityAt: serverTimestamp()
            }).catch(err => {
              console.error("Error updating online status:", err);
            });
          }
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
      {!loading ? children : (
        <div className="flex justify-center items-center h-screen bg-[var(--bg-primary)]">
          <div className="loading-spinner"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}