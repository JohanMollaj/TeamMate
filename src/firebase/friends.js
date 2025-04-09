// src/firebase/friends.js
import { db } from './config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

// Helper to create a consistent friendship ID
const createFriendshipId = (user1Id, user2Id) => {
  // Always order IDs alphabetically to ensure consistency
  const sortedIds = [user1Id, user2Id].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Send friend request
export const sendFriendRequest = async (currentUserId, targetUserId) => {
  try {
    // Check if there's already a friendship document
    const sortedIds = [currentUserId, targetUserId].sort();
    const friendshipId = createFriendshipId(currentUserId, targetUserId);
    
    const friendshipRef = doc(db, 'friendships', friendshipId);
    const friendshipDoc = await getDoc(friendshipRef);
    
    if (friendshipDoc.exists()) {
      const data = friendshipDoc.data();
      
      // If already friends
      if (data.status === 'accepted') {
        throw new Error('Already friends');
      }
      
      // If already pending
      if (data.status === 'pending') {
        // If current user already sent request
        if (data.requestedBy === currentUserId) {
          throw new Error('Friend request already sent');
        }
        
        // If other user sent request, accept it
        await updateDoc(friendshipRef, {
          status: 'accepted',
          updatedAt: serverTimestamp()
        });
        return { status: 'accepted' };
      }
      
      // If previously declined, create a new request
      if (data.status === 'declined') {
        await updateDoc(friendshipRef, {
          status: 'pending',
          requestedBy: currentUserId,
          updatedAt: serverTimestamp()
        });
        return { status: 'pending' };
      }
      
      // If blocked, don't allow request
      if (data.status === 'blocked') {
        throw new Error('Cannot send friend request');
      }
    } else {
      // Create new friendship doc
      await setDoc(friendshipRef, {
        user1: sortedIds[0],
        user2: sortedIds[1],
        status: 'pending',
        requestedBy: currentUserId,
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { status: 'pending' };
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// Get all friends (accepted)
export const getFriends = async (userId) => {
  try {
    const friends = [];
    
    // Query where user is user1
    const q1 = query(
      collection(db, 'friendships'),
      where('user1', '==', userId),
      where('status', '==', 'accepted')
    );
    
    // Query where user is user2
    const q2 = query(
      collection(db, 'friendships'),
      where('user2', '==', userId),
      where('status', '==', 'accepted')
    );
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    // Get friend IDs (the other user in each friendship)
    const friendIds = [];
    
    snap1.forEach(doc => {
      const data = doc.data();
      friendIds.push(data.user2);
    });
    
    snap2.forEach(doc => {
      const data = doc.data();
      friendIds.push(data.user1);
    });
    
    // Get full user details for each friend
    const friendPromises = friendIds.map(friendId => 
      getDoc(doc(db, 'users', friendId))
    );
    
    const friendDocs = await Promise.all(friendPromises);
    
    friendDocs.forEach(friendDoc => {
      if (friendDoc.exists()) {
        friends.push({
          id: friendDoc.id,
          ...friendDoc.data()
        });
      }
    });
    
    return friends;
  } catch (error) {
    console.error('Error getting friends:', error);
    throw error;
  }
};

// Get pending friend requests (both sent and received)
export const getPendingFriendRequests = async (userId) => {
  try {
    const pendingRequests = {
      sent: [],
      received: []
    };
    
    // Find all friendships with pending status where this user is involved
    const q1 = query(
      collection(db, 'friendships'),
      where('user1', '==', userId),
      where('status', '==', 'pending')
    );
    
    const q2 = query(
      collection(db, 'friendships'),
      where('user2', '==', userId),
      where('status', '==', 'pending')
    );
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    // Process requests
    const processRequest = (data, docId) => {
      if (data.requestedBy === userId) {
        // User sent this request
        const otherUserId = data.user1 === userId ? data.user2 : data.user1;
        pendingRequests.sent.push({
          friendshipId: docId,
          userId: otherUserId,
          requestedAt: data.requestedAt
        });
      } else {
        // User received this request
        pendingRequests.received.push({
          friendshipId: docId,
          userId: data.requestedBy,
          requestedAt: data.requestedAt
        });
      }
    };
    
    snap1.forEach(doc => {
      processRequest(doc.data(), doc.id);
    });
    
    snap2.forEach(doc => {
      processRequest(doc.data(), doc.id);
    });
    
    // Get full user details for each request
    const getAllUserDetails = async (requests) => {
      const userIds = requests.map(req => req.userId);
      
      if (userIds.length === 0) return requests;
      
      const userPromises = userIds.map(userId => 
        getDoc(doc(db, 'users', userId))
      );
      
      const userDocs = await Promise.all(userPromises);
      
      return requests.map((req, index) => {
        const userDoc = userDocs[index];
        if (userDoc.exists()) {
          return {
            ...req,
            user: {
              id: userDoc.id,
              ...userDoc.data()
            }
          };
        }
        return req;
      });
    };
    
    // Get user details for all requests
    pendingRequests.sent = await getAllUserDetails(pendingRequests.sent);
    pendingRequests.received = await getAllUserDetails(pendingRequests.received);
    
    return pendingRequests;
  } catch (error) {
    console.error('Error getting pending friend requests:', error);
    throw error;
  }
};

// Accept friend request
export const acceptFriendRequest = async (friendshipId) => {
  try {
    const friendshipRef = doc(db, 'friendships', friendshipId);
    await updateDoc(friendshipRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

// Decline friend request
export const declineFriendRequest = async (friendshipId) => {
  try {
    const friendshipRef = doc(db, 'friendships', friendshipId);
    await updateDoc(friendshipRef, {
      status: 'declined',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw error;
  }
};

// Cancel sent friend request
export const cancelFriendRequest = async (friendshipId) => {
  try {
    const friendshipRef = doc(db, 'friendships', friendshipId);
    await deleteDoc(friendshipRef);
  } catch (error) {
    console.error('Error canceling friend request:', error);
    throw error;
  }
};

// Remove friend (unfriend)
export const removeFriend = async (friendshipId) => {
  try {
    const friendshipRef = doc(db, 'friendships', friendshipId);
    await deleteDoc(friendshipRef);
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

// Block user
export const blockUser = async (currentUserId, targetUserId) => {
  try {
    const friendshipId = createFriendshipId(currentUserId, targetUserId);
    const sortedIds = [currentUserId, targetUserId].sort();
    const friendshipRef = doc(db, 'friendships', friendshipId);
    
    // Check if friendship exists
    const friendshipDoc = await getDoc(friendshipRef);
    
    if (friendshipDoc.exists()) {
      // Update existing friendship to blocked
      await updateDoc(friendshipRef, {
        status: 'blocked',
        blockedBy: currentUserId,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new blocked relationship
      await setDoc(friendshipRef, {
        user1: sortedIds[0],
        user2: sortedIds[1],
        status: 'blocked',
        blockedBy: currentUserId,
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

// Check friendship status
export const getFriendshipStatus = async (userId1, userId2) => {
  try {
    const friendshipId = createFriendshipId(userId1, userId2);
    const friendshipRef = doc(db, 'friendships', friendshipId);
    const friendshipDoc = await getDoc(friendshipRef);
    
    if (friendshipDoc.exists()) {
      const data = friendshipDoc.data();
      return {
        status: data.status,
        requestedBy: data.requestedBy,
        friendshipId: friendshipDoc.id
      };
    }
    
    return { status: 'none' };
  } catch (error) {
    console.error('Error checking friendship status:', error);
    throw error;
  }
};