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
  arrayRemove,
  limit // <-- Added limit import
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { createFriendRequestNotification } from './notificationService'; // Import notification function

// Get current user's profile data
export async function getCurrentUserProfile() {
  if (!auth.currentUser) {
      throw new Error("No authenticated user found");
  }

  const userRef = doc(db, "users", auth.currentUser.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
      // Attempt to initialize settings if profile doesn't exist yet
      await initializeUserSettings();
      const newUserDoc = await getDoc(userRef);
      if (!newUserDoc.exists()) {
          return null; // Still doesn't exist after initialization attempt
      }
       return {
          id: newUserDoc.id,
          ...newUserDoc.data()
      };
  }

  // Ensure settings exist, initialize if not
  if (!userDoc.data().settings) {
      await initializeUserSettings();
      const updatedUserDoc = await getDoc(userRef);
       return {
          id: updatedUserDoc.id,
          ...updatedUserDoc.data()
      };
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

// Find a single user by username
export async function findUserByUsername(username) {
  if (!username) {
      throw new Error("Username cannot be empty");
  }

  // Query the 'users' collection
  const usersRef = collection(db, "users");
  // Ensure the username matches exactly (Firestore queries are case-sensitive by default)
  const q = query(usersRef, where("username", "==", username.trim()), limit(1));

  try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          // No user found with that username
          return null;
      } else {
          // Return the user data including the ID
          const userDoc = querySnapshot.docs[0];
          return {
              id: userDoc.id,
              ...userDoc.data()
          };
      }
  } catch (error) {
      console.error("Error finding user by username:", error);
      throw error; // Re-throw the error to be handled by the caller
  }
}


// Update user profile
export async function updateUserProfile(userData) {
  if (!auth.currentUser) {
      throw new Error("No authenticated user found");
  }

  const userRef = doc(db, "users", auth.currentUser.uid);

  // Prepare updates, avoiding undefined values
  const updates = {};
  if (userData.displayName !== undefined) updates.displayName = userData.displayName;
  if (userData.username !== undefined) updates.username = userData.username;
  if (userData.bio !== undefined) updates.bio = userData.bio;
  if (userData.profilePicture !== undefined) updates.profilePicture = userData.profilePicture;
  if (userData.qualifications !== undefined) updates.qualifications = userData.qualifications;


  // If displayName is being updated, also update Auth profile
  if (userData.displayName) {
      try {
          await updateProfile(auth.currentUser, {
              displayName: userData.displayName
          });
      } catch (authError) {
          console.error("Error updating auth display name:", authError);
          // Decide if you want to throw or just log
      }
  }

  // If photoURL is being updated, also update Auth profile
  if (userData.profilePicture) {
       try {
          await updateProfile(auth.currentUser, {
              photoURL: userData.profilePicture
          });
      } catch (authError) {
          console.error("Error updating auth photo URL:", authError);
          // Decide if you want to throw or just log
      }
  }

  // Add updatedAt timestamp
  updates.updatedAt = serverTimestamp();


  return updateDoc(userRef, updates);
}

// Update user settings
export async function updateUserSettings(settingsData) {
  if (!auth.currentUser) {
      throw new Error("No authenticated user found");
  }

  const userRef = doc(db, "users", auth.currentUser.uid);

  // Ensure nested structure for settings update
  const updates = {};
  for (const key in settingsData) {
      updates[`settings.${key}`] = settingsData[key];
  }
  updates.updatedAt = serverTimestamp();


  return updateDoc(userRef, updates);
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
      // Allow fetching all users even if not logged in for signup/login scenarios if needed
      // Or throw error based on your app's logic
      console.warn("getAllUsers called without authenticated user.");
       // throw new Error("No authenticated user found");
  }

  const usersQuery = query(collection(db, "users"));
  const querySnapshot = await getDocs(usersQuery);

  // Filter out current user if logged in
  const users = querySnapshot.docs
      .map(doc => ({
          id: doc.id,
          ...doc.data()
      }))
      .filter(user => !auth.currentUser || user.id !== auth.currentUser.uid); // Only filter if currentUser exists

  return users;
}


// Search users by name or username
export async function searchUsers(searchTerm) {

   const lowerSearchTerm = searchTerm.toLowerCase();

  // This is a simple implementation that fetches all users and filters client-side
  // For a production app, you might want to use Firestore indexes or a different search solution
  const users = await getAllUsers(); // Will filter out current user if logged in

  return users.filter(user =>
      (user.displayName && user.displayName.toLowerCase().includes(lowerSearchTerm)) ||
      (user.username && user.username.toLowerCase().includes(lowerSearchTerm))
  );
}

// Get current user's friends
export function getUserFriends(userId, callback) {
    if (!userId || typeof callback !== 'function') {
      console.error("getUserFriends: Invalid parameters", { userId, callbackType: typeof callback });
      return () => {}; // Return no-op unsubscribe function
    }
  
    try {
      // For development or demo purposes, fetch from JSON file instead of Firestore
      const fetchFriendsFromJson = async () => {
        try {
          const response = await fetch('/users.json');
          const allUsers = await response.json();
          
          // Simulate friends by taking first few users
          const mockFriends = allUsers.slice(0, 4).map(user => ({
            ...user,
            chatType: 'direct',
            isOnline: Math.random() > 0.5 // Random online status
          }));
          
          callback(mockFriends);
        } catch (error) {
          console.error("Error fetching mock friends:", error);
          callback([]);
        }
      };
      
      fetchFriendsFromJson();
      
      // Return an empty unsubscribe function
      return () => {};
    } catch (error) {
      console.error("Error in getUserFriends:", error);
      callback([]);
      return () => {};
    }
  }
  
  // groupService.js modifications
  // Replace the getUserGroups function with this version
  
  export function getUserGroups(callback) {
    if (typeof callback !== 'function') {
      console.error("getUserGroups: Callback is not a function", { callbackType: typeof callback });
      return () => {}; // Return no-op unsubscribe function
    }
  
    try {
      // For development or demo purposes, fetch from JSON file instead of Firestore
      const fetchGroupsFromJson = async () => {
        try {
          const response = await fetch('/groups.json');
          const data = await response.json();
          
          // Add additional properties to match what components expect
          const enhancedGroups = data.map(group => ({
            ...group,
            chatType: 'group',
            name: group.name || `Group ${group.id}`,
            members: ['1', '2', '3'], // Mock member IDs
            description: `Description for ${group.name || 'group'}`,
            createdAt: new Date().toISOString()
          }));
          
          callback(enhancedGroups);
        } catch (error) {
          console.error("Error fetching mock groups:", error);
          callback([]);
        }
      };
      
      fetchGroupsFromJson();
      
      // Return an empty unsubscribe function
      return () => {};
    } catch (error) {
      console.error("Error in getUserGroups:", error);
      callback([]);
      return () => {};
    }
  }

// Send friend request
export async function sendFriendRequest(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) {
      throw new Error("User IDs are required");
  }

  if (targetUserId === currentUserId) {
      throw new Error("Cannot send friend request to yourself");
  }

  const currentUserRef = doc(db, "users", currentUserId);
  const currentUserDoc = await getDoc(currentUserRef);
  if (!currentUserDoc.exists()) throw new Error("Current user not found");
  const currentUserData = currentUserDoc.data();

  if (currentUserData.friends?.includes(targetUserId)) {
       throw new Error("You are already friends with this user.");
  }
   if (currentUserData.outgoingFriendRequests?.some(req => req.userId === targetUserId)) {
       throw new Error("Friend request already sent.");
   }
   if (currentUserData.incomingFriendRequests?.some(req => req.userId === targetUserId)) {
       throw new Error("This user has already sent you a friend request. Check your notifications.");
   }

  // Use client-side timestamp (new Date()) instead of serverTimestamp() here
  const clientTimestamp = new Date(); // Get current time from the client

  // Add to target user's incoming requests
  const targetUserRef = doc(db, "users", targetUserId);
  await updateDoc(targetUserRef, {
      incomingFriendRequests: arrayUnion({
          userId: currentUserId,
          timestamp: clientTimestamp, // Use client timestamp
          senderName: currentUserData.displayName || currentUserData.username || "A user"
      })
  });

  // Add to current user's outgoing requests
  await updateDoc(currentUserRef, {
      outgoingFriendRequests: arrayUnion({
          userId: targetUserId,
          timestamp: clientTimestamp // Use client timestamp
      })
  });

  // Create the notification for the target user
  try {
      // Note: createFriendRequestNotification might use serverTimestamp() internally,
      // which is fine because it uses addDoc (a form of set).
      await createFriendRequestNotification(targetUserId, currentUserId);
      console.log(`Notification created for user ${targetUserId}`);
  } catch (notificationError) {
      console.error("Failed to create friend request notification:", notificationError);
  }

  return true;
}


// Accept friend request
export async function acceptFriendRequest(requesterId) {
  if (!auth.currentUser) {
      throw new Error("No authenticated user found");
  }

  const currentUserRef = doc(db, "users", auth.currentUser.uid);
  const requesterRef = doc(db, "users", requesterId);

  // Find the specific request object to remove (using userId)
  const currentUserDoc = await getDoc(currentUserRef);
  const incomingRequests = currentUserDoc.data().incomingFriendRequests || [];
  const requestToRemove = incomingRequests.find(req => req.userId === requesterId);

  const requesterDoc = await getDoc(requesterRef);
  const outgoingRequests = requesterDoc.data().outgoingFriendRequests || [];
  const outgoingToRemove = outgoingRequests.find(req => req.userId === auth.currentUser.uid);


  // Remove from current user's incoming requests and add to friends
  await updateDoc(currentUserRef, {
      // Use the found object for removal if it exists
      incomingFriendRequests: requestToRemove ? arrayRemove(requestToRemove) : arrayRemove({ userId: requesterId }), // Fallback just in case
      friends: arrayUnion(requesterId)
  });

  // Remove from requester's outgoing requests and add as friend
  await updateDoc(requesterRef, {
      // Use the found object for removal if it exists
      outgoingFriendRequests: outgoingToRemove ? arrayRemove(outgoingToRemove) : arrayRemove({ userId: auth.currentUser.uid }), // Fallback
      friends: arrayUnion(auth.currentUser.uid)
  });

  // Optional: Create a notification for the requester that the request was accepted

  return true;
}


// Decline friend request
export async function declineFriendRequest(requesterId) {
  if (!auth.currentUser) {
      throw new Error("No authenticated user found");
  }

  const currentUserRef = doc(db, "users", auth.currentUser.uid);
  const requesterRef = doc(db, "users", requesterId);

  // Find the specific request object to remove
  const currentUserDoc = await getDoc(currentUserRef);
  const incomingRequests = currentUserDoc.data().incomingFriendRequests || [];
  const requestToRemove = incomingRequests.find(req => req.userId === requesterId);


  const requesterDoc = await getDoc(requesterRef);
  const outgoingRequests = requesterDoc.data().outgoingFriendRequests || [];
  const outgoingToRemove = outgoingRequests.find(req => req.userId === auth.currentUser.uid);


  // Remove from current user's incoming requests
  await updateDoc(currentUserRef, {
      incomingFriendRequests: requestToRemove ? arrayRemove(requestToRemove) : arrayRemove({ userId: requesterId })
  });

  // Remove from requester's outgoing requests
  await updateDoc(requesterRef, {
      outgoingFriendRequests: outgoingToRemove ? arrayRemove(outgoingToRemove) : arrayRemove({ userId: auth.currentUser.uid })
  });

  // Optional: Create a notification for the requester that the request was declined

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

// Get incoming friend requests with details
export function getIncomingFriendRequests(callback) {
  if (!auth.currentUser) {
      console.warn("getIncomingFriendRequests called without authenticated user.");
      callback([]);
      return () => {}; // Return an empty unsubscribe function
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

      // Fetch requester details for each request
      // Note: This can be inefficient if there are many requests.
      // Consider storing senderName directly in the request object when sending.
      const requestsWithDetails = await Promise.all(
          requests.map(async (request) => {
              const requester = await getUserProfile(request.userId);
              return {
                  ...request, // Includes userId and timestamp
                  requester // Full profile of the sender
              };
          })
      );

      callback(requestsWithDetails.filter(req => req.requester)); // Filter out requests where requester profile couldn't be found

  }, (error) => {
      console.error("Error listening to incoming friend requests:", error);
      callback([]);
  });
}


// Initialize user settings and subcollections if they don't exist
export async function initializeUserSettings() {
  if (!auth.currentUser) {
      // Don't throw error, just return if no user
      console.log("initializeUserSettings: No authenticated user.");
      return;
  }

  const userRef = doc(db, "users", auth.currentUser.uid);
  let userDoc;

  try {
      userDoc = await getDoc(userRef);
  } catch (error) {
      console.error("Error fetching user doc during initialization:", error);
      return; // Exit if fetching fails
  }


  const defaultSettings = {
      theme: 'dark',
      fontSize: 'medium',
      notifications: {
          messages: true,
          friendRequests: true,
          groupMessages: true,
          taskReminders: true
      }
  };

  if (!userDoc.exists()) {
      console.log(`User document for ${auth.currentUser.uid} not found. Creating with defaults.`);
      // Create user document with default fields and settings
      try {
          await setDoc(userRef, {
              uid: auth.currentUser.uid,
              displayName: auth.currentUser.displayName || '',
              email: auth.currentUser.email || '',
              username: auth.currentUser.email ? auth.currentUser.email.split('@')[0] : `user_${auth.currentUser.uid.substring(0, 5)}`, // Ensure username exists
              profilePicture: auth.currentUser.photoURL || null,
              bio: '',
              qualifications: '',
              isOnline: true,
              lastActive: serverTimestamp(),
              friends: [],
              incomingFriendRequests: [],
              outgoingFriendRequests: [],
              createdAt: serverTimestamp(),
              settings: defaultSettings // Add default settings
          });
           console.log(`User document created for ${auth.currentUser.uid}`);
      } catch (error) {
           console.error("Error creating user document:", error);
      }
  } else if (!userDoc.data().settings) {
      console.log(`User ${auth.currentUser.uid} found, but settings are missing. Adding default settings.`);
      // Only update if settings don't exist
      try {
          await updateDoc(userRef, {
              settings: defaultSettings
          });
          console.log(`Default settings added for user ${auth.currentUser.uid}`);
      } catch (error) {
          console.error("Error updating user document with default settings:", error);
      }
  } else {
       console.log(`User ${auth.currentUser.uid} document and settings already exist.`);
  }
}