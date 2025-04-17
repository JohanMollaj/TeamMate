import { 
    doc, 
    getDoc, 
    updateDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    onSnapshot,
    serverTimestamp,
    arrayUnion,
    arrayRemove
  } from 'firebase/firestore';
  import { updateProfile } from 'firebase/auth';
  import { db, auth } from '../firebase';
  
  // Get current user's profile data
  export async function getCurrentUserProfile() {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  }
  
  // Get any user's profile by their ID
  export async function getUserProfile(userId) {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  }
  
  // Update user profile
  export async function updateUserProfile(userData) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    // If displayName is being updated, also update Auth profile
    if (userData.displayName) {
      await updateProfile(auth.currentUser, {
        displayName: userData.displayName
      });
    }
    
    // If photoURL is being updated, also update Auth profile
    if (userData.profilePicture) {
      await updateProfile(auth.currentUser, {
        photoURL: userData.profilePicture
      });
    }
    
    return updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  }
  
  // Update user settings
  export async function updateUserSettings(settingsData) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    return updateDoc(userRef, {
      settings: {
        ...settingsData
      },
      updatedAt: serverTimestamp()
    });
  }
  
  // Update theme preference
  export async function updateThemePreference(theme) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    return updateDoc(userRef, {
      'settings.theme': theme,
      updatedAt: serverTimestamp()
    });
  }
  
  // Get all users for friend suggestions
  export async function getAllUsers() {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const usersQuery = query(collection(db, "users"));
    const querySnapshot = await getDocs(usersQuery);
    
    // Filter out current user
    const users = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user => user.id !== auth.currentUser.uid);
    
    return users;
  }
  
  // Search users by name or username
  export async function searchUsers(searchTerm) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    // This is a simple implementation that fetches all users and filters client-side
    // For a production app, you might want to use Firestore indexes or a different search solution
    const users = await getAllUsers();
    
    return users.filter(user => 
      (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  // Get current user's friends
  export function getUserFriends(callback) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    return onSnapshot(userRef, async (userDoc) => {
      if (!userDoc.exists()) {
        callback([]);
        return;
      }
      
      const userData = userDoc.data();
      const friendIds = userData.friends || [];
      
      if (friendIds.length === 0) {
        callback([]);
        return;
      }
      
      // Fetch friend details in batches of 10
      const friends = [];
      for (let i = 0; i < friendIds.length; i += 10) {
        const batch = friendIds.slice(i, i + 10);
        const friendPromises = batch.map(id => getUserProfile(id));
        const friendResults = await Promise.all(friendPromises);
        friends.push(...friendResults.filter(Boolean)); // Filter out any null results
      }
      
      callback(friends);
    });
  }
  
  // Send friend request
  export async function sendFriendRequest(targetUserId) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    if (targetUserId === auth.currentUser.uid) {
      throw new Error("Cannot send friend request to yourself");
    }
    
    // Add to target user's incoming requests
    const targetUserRef = doc(db, "users", targetUserId);
    await updateDoc(targetUserRef, {
      incomingFriendRequests: arrayUnion({
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp()
      })
    });
    
    // Add to current user's outgoing requests
    const currentUserRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(currentUserRef, {
      outgoingFriendRequests: arrayUnion({
        userId: targetUserId,
        timestamp: serverTimestamp()
      })
    });
    
    return true;
  }
  
  // Accept friend request
  export async function acceptFriendRequest(requesterId) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const currentUserRef = doc(db, "users", auth.currentUser.uid);
    const requesterRef = doc(db, "users", requesterId);
    
    // Remove from current user's incoming requests
    await updateDoc(currentUserRef, {
      incomingFriendRequests: arrayRemove({
        userId: requesterId
      }),
      friends: arrayUnion(requesterId)
    });
    
    // Remove from requester's outgoing requests and add as friend
    await updateDoc(requesterRef, {
      outgoingFriendRequests: arrayRemove({
        userId: auth.currentUser.uid
      }),
      friends: arrayUnion(auth.currentUser.uid)
    });
    
    return true;
  }
  
  // Decline friend request
  export async function declineFriendRequest(requesterId) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const currentUserRef = doc(db, "users", auth.currentUser.uid);
    const requesterRef = doc(db, "users", requesterId);
    
    // Remove from current user's incoming requests
    await updateDoc(currentUserRef, {
      incomingFriendRequests: arrayRemove({
        userId: requesterId
      })
    });
    
    // Remove from requester's outgoing requests
    await updateDoc(requesterRef, {
      outgoingFriendRequests: arrayRemove({
        userId: auth.currentUser.uid
      })
    });
    
    return true;
  }
  
  // Remove friend
  export async function removeFriend(friendId) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const currentUserRef = doc(db, "users", auth.currentUser.uid);
    const friendRef = doc(db, "users", friendId);
    
    // Remove from both users' friends arrays
    await updateDoc(currentUserRef, {
      friends: arrayRemove(friendId)
    });
    
    await updateDoc(friendRef, {
      friends: arrayRemove(auth.currentUser.uid)
    });
    
    return true;
  }
  
  // Get incoming friend requests
  export function getIncomingFriendRequests(callback) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    return onSnapshot(userRef, async (userDoc) => {
      if (!userDoc.exists()) {
        callback([]);
        return;
      }
      
      const userData = userDoc.data();
      const requests = userData.incomingFriendRequests || [];
      
      if (requests.length === 0) {
        callback([]);
        return;
      }
      
      // Fetch requester details
      const requestsWithDetails = await Promise.all(
        requests.map(async (request) => {
          const requester = await getUserProfile(request.userId);
          return {
            ...request,
            requester
          };
        })
      );
      
      callback(requestsWithDetails);
    });
  }
  
  // Initialize user settings if they don't exist
  export async function initializeUserSettings() {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create user document with default settings
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        username: auth.currentUser.email ? auth.currentUser.email.split('@')[0] : '',
        profilePicture: auth.currentUser.photoURL || null,
        bio: '',
        qualifications: '',
        isOnline: true,
        lastActive: serverTimestamp(),
        friends: [],
        incomingFriendRequests: [],
        outgoingFriendRequests: [],
        createdAt: serverTimestamp(),
        settings: {
          theme: 'dark',
          fontSize: 'medium',
          notifications: {
            messages: true,
            friendRequests: true,
            groupMessages: true,
            taskReminders: true
          }
        }
      });
    } else if (!userDoc.data().settings) {
      // Only update if settings don't exist
      await updateDoc(userRef, {
        settings: {
          theme: 'dark',
          fontSize: 'medium',
          notifications: {
            messages: true,
            friendRequests: true,
            groupMessages: true,
            taskReminders: true
          }
        }
      });
    }
  }