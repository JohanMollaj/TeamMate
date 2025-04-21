import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc, 
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    onSnapshot
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  // Get friends for current user
  export function getUserFriends(userId, callback) {
    // Create a reference to the friends subcollection
    const friendsRef = collection(db, "users", userId, "friends");
    
    // Listen for real-time updates
    return onSnapshot(friendsRef, (snapshot) => {
      const promises = snapshot.docs.map(async (doc) => {
        // Get the friend user data
        const friendData = doc.data();
        const friendId = friendData.userId;
        
        // Get the friend's user profile
        const userDoc = await getDoc(doc(db, "users", friendId));
        
        if (userDoc.exists()) {
          return {
            id: friendId,
            chatType: 'direct',
            ...userDoc.data()
          };
        }
        return null;
      });
      
      // Wait for all promises to resolve
      Promise.all(promises).then((friendsData) => {
        // Filter out null values
        const validFriends = friendsData.filter(friend => friend !== null);
        callback(validFriends);
      });
    });
  }
  
  // Send friend request
  export async function sendFriendRequest(currentUserId, targetUserId) {
    // First check if this friendship already exists
    const friendDocRef = doc(db, "users", currentUserId, "friends", targetUserId);
    const friendDoc = await getDoc(friendDocRef);
    
    if (friendDoc.exists()) {
      throw new Error("Friendship already exists");
    }
    
    // Get current user data
    const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
    const targetUserDoc = await getDoc(doc(db, "users", targetUserId));
    
    if (!targetUserDoc.exists()) {
      throw new Error("User not found");
    }
    
    const currentUserData = currentUserDoc.data();
    
    // Create friendship on current user's side
    await setDoc(friendDocRef, {
      userId: targetUserId,
      status: "pending_sent",
      createdAt: serverTimestamp()
    });
    
    // Create friendship on target user's side
    const targetFriendDocRef = doc(db, "users", targetUserId, "friends", currentUserId);
    await setDoc(targetFriendDocRef, {
      userId: currentUserId,
      displayName: currentUserData.displayName,
      status: "pending_received",
      createdAt: serverTimestamp()
    });
    
    // Add notification for the target user
    const notificationRef = collection(db, "users", targetUserId, "notifications");
    await addDoc(notificationRef, {
      type: "friend_request",
      fromUserId: currentUserId,
      fromUserName: currentUserData.displayName,
      read: false,
      createdAt: serverTimestamp()
    });
  }
  
  // Accept friend request
  export async function acceptFriendRequest(currentUserId, friendId) {
    // Update status on current user's side
    const currentUserFriendRef = doc(db, "users", currentUserId, "friends", friendId);
    await updateDoc(currentUserFriendRef, {
      status: "accepted",
      updatedAt: serverTimestamp()
    });
    
    // Update status on friend's side
    const friendUserRef = doc(db, "users", friendId, "friends", currentUserId);
    await updateDoc(friendUserRef, {
      status: "accepted",
      updatedAt: serverTimestamp()
    });
  }
  
  // Decline friend request
  export async function declineFriendRequest(currentUserId, friendId) {
    // Delete from current user's friends
    const currentUserFriendRef = doc(db, "users", currentUserId, "friends", friendId);
    await deleteDoc(currentUserFriendRef);
    
    // Delete from friend's friends
    const friendUserRef = doc(db, "users", friendId, "friends", currentUserId);
    await deleteDoc(friendUserRef);
  }
  
  // Remove friend
  export async function removeFriend(currentUserId, friendId) {
    // Delete from current user's friends
    const currentUserFriendRef = doc(db, "users", currentUserId, "friends", friendId);
    await deleteDoc(currentUserFriendRef);
    
    // Delete from friend's friends
    const friendUserRef = doc(db, "users", friendId, "friends", currentUserId);
    await deleteDoc(friendUserRef);
  }
  
  // Find users by username or display name (for adding friends)
  export async function findUsersByName(searchTerm) {
    if (!searchTerm || searchTerm.length < 3) {
      return []; // Require at least 3 characters to search
    }
    
    const usersRef = collection(db, "users");
    
    // Search by display name
    const displayNameQuery = query(
      usersRef, 
      where("displayName", ">=", searchTerm),
      where("displayName", "<=", searchTerm + '\uf8ff')
    );
    
    // Search by username
    const usernameQuery = query(
      usersRef, 
      where("username", ">=", searchTerm),
      where("username", "<=", searchTerm + '\uf8ff')
    );
    
    // Execute both queries
    const [displayNameSnapshot, usernameSnapshot] = await Promise.all([
      getDocs(displayNameQuery),
      getDocs(usernameQuery)
    ]);
    
    // Combine and deduplicate results
    const resultMap = new Map();
    
    displayNameSnapshot.docs.forEach(doc => {
      resultMap.set(doc.id, {
        id: doc.id,
        ...doc.data()
      });
    });
    
    usernameSnapshot.docs.forEach(doc => {
      resultMap.set(doc.id, {
        id: doc.id,
        ...doc.data()
      });
    });
    
    return Array.from(resultMap.values());
  }