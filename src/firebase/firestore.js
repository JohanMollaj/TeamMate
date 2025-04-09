// src/firebase/firestore.js
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './config';
  
  // Users
  export const getUserById = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  };
  
  export const updateUserProfile = async (userId, userData) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  };
  
  // Friends
  export const getFriends = async (userId) => {
    try {
      const friendsQuery = query(
        collection(db, 'friends'),
        where('userId', '==', userId),
        where('status', '==', 'accepted')
      );
      const snapshot = await getDocs(friendsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  };
  
  export const sendFriendRequest = async (currentUserId, friendId) => {
    try {
      await addDoc(collection(db, 'friends'), {
        userId: currentUserId,
        friendId: friendId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  };
  
  // Messages
  export const getMessages = async (chatId) => {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(messagesQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  };
  
  export const sendMessage = async (chatId, senderId, text) => {
    try {
      await addDoc(collection(db, 'messages'), {
        chatId,
        senderId,
        text,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  };
  
  // Tasks
  export const getTasks = async (userId) => {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId),
        orderBy('dueDate', 'asc')
      );
      const snapshot = await getDocs(tasksQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  };
  
  export const createTask = async (taskData) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  };
  
  export const updateTask = async (taskId, taskData) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        ...taskData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  };
  
  export const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      throw error;
    }
  };
  
  // Groups
  export const getGroups = async (userId) => {
    try {
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userId)
      );
      const snapshot = await getDocs(groupsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  };
  
  export const createGroup = async (groupData) => {
    try {
      await addDoc(collection(db, 'groups'), {
        ...groupData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  };