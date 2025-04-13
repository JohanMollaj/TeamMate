import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  // Get direct messages between two users
  export function getDirectMessages(user1Id, user2Id, callback) {
    // Query messages where sender is user1 and receiver is user2 OR sender is user2 and receiver is user1
    const q = query(
      collection(db, "messages"),
      where("type", "==", "direct"),
      where("participants", "array-contains", user1Id),
      orderBy("timestamp", "asc")
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(message => message.participants.includes(user2Id));
      
      callback(messages);
    });
  }
  
  // Get messages for a specific group
  export function getGroupMessages(groupId, callback) {
    const q = query(
      collection(db, "messages"),
      where("groupId", "==", groupId),
      where("type", "==", "group"),
      orderBy("timestamp", "asc")
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      callback(messages);
    });
  }
  
  // Send a direct message
  export async function sendDirectMessage(senderId, receiverId, messageText) {
    return addDoc(collection(db, "messages"), {
      senderId,
      receiverId,
      type: "direct",
      participants: [senderId, receiverId],
      message: messageText,
      timestamp: serverTimestamp(),
      edited: false
    });
  }
  
  // Send a group message
  export async function sendGroupMessage(senderId, groupId, messageText) {
    // First get the group to get its participants
    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      throw new Error("Group does not exist");
    }
    
    const groupData = groupDoc.data();
    
    return addDoc(collection(db, "messages"), {
      senderId,
      groupId,
      type: "group",
      participants: groupData.members,
      message: messageText,
      timestamp: serverTimestamp(),
      edited: false
    });
  }
  
  // Edit a message
  export async function editMessage(messageId, newText) {
    const messageRef = doc(db, "messages", messageId);
    
    return updateDoc(messageRef, {
      message: newText,
      edited: true,
      editedTimestamp: serverTimestamp()
    });
  }
  
  // Delete a message
  export async function deleteMessage(messageId) {
    const messageRef = doc(db, "messages", messageId);
    return deleteDoc(messageRef);
  }