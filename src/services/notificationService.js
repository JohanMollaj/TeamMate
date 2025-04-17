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
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp
  } from 'firebase/firestore';
  import { db, auth } from '../firebase';
  
  // Get all notifications for the current user
  export function getUserNotifications(callback) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(50) // Limit to most recent 50 notifications
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp ? 
          doc.data().createdAt.toDate() : 
          doc.data().createdAt
      }));
      
      callback(notifications);
    });
  }
  
  // Get unread notifications for the current user
  export function getUnreadNotifications(callback) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp ? 
          doc.data().createdAt.toDate() : 
          doc.data().createdAt
      }));
      
      callback(notifications);
    });
  }
  
  // Get notifications by type
  export function getNotificationsByType(type, callback) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      where("type", "==", type),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp ? 
          doc.data().createdAt.toDate() : 
          doc.data().createdAt
      }));
      
      callback(notifications);
    });
  }
  
  // Mark notification as read
  export async function markNotificationAsRead(notificationId) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const notificationRef = doc(db, "notifications", notificationId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (!notificationDoc.exists()) {
      throw new Error("Notification not found");
    }
    
    // Verify this notification belongs to the current user
    if (notificationDoc.data().userId !== auth.currentUser.uid) {
      throw new Error("You don't have permission to modify this notification");
    }
    
    return updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
  }
  
  // Mark all notifications as read
  export async function markAllNotificationsAsRead() {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      })
    );
    
    return Promise.all(updatePromises);
  }
  
  // Delete a notification
  export async function deleteNotification(notificationId) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const notificationRef = doc(db, "notifications", notificationId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (!notificationDoc.exists()) {
      throw new Error("Notification not found");
    }
    
    // Verify this notification belongs to the current user
    if (notificationDoc.data().userId !== auth.currentUser.uid) {
      throw new Error("You don't have permission to delete this notification");
    }
    
    return deleteDoc(notificationRef);
  }
  
  // Delete all read notifications
  export async function deleteAllReadNotifications() {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      where("read", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    return Promise.all(deletePromises);
  }
  
  // Create a notification
  export async function createNotification(userId, notificationData) {
    // This is an internal function that will be called by other services
    // It should not be exposed directly to components
    
    const notification = {
      userId,
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    };
    
    return addDoc(collection(db, "notifications"), notification);
  }
  
  // Create a message notification
  export async function createMessageNotification(userId, senderId, messageText, messageType = 'direct') {
    // Get sender details for the notification
    const senderRef = doc(db, "users", senderId);
    const senderDoc = await getDoc(senderRef);
    
    let senderName = "Someone";
    if (senderDoc.exists()) {
      senderName = senderDoc.data().displayName || senderDoc.data().username || "Someone";
    }
    
    const truncatedMessage = messageText.length > 50 ? 
      `${messageText.substring(0, 47)}...` : 
      messageText;
    
    return createNotification(userId, {
      type: "message",
      title: `New message from ${senderName}`,
      message: truncatedMessage,
      senderId,
      messageType,
      groupId: messageType === 'group' ? messageType.groupId : null
    });
  }
  
  // Create a friend request notification
  export async function createFriendRequestNotification(userId, requesterId) {
    // Get requester details
    const requesterRef = doc(db, "users", requesterId);
    const requesterDoc = await getDoc(requesterRef);
    
    let requesterName = "Someone";
    if (requesterDoc.exists()) {
      requesterName = requesterDoc.data().displayName || requesterDoc.data().username || "Someone";
    }
    
    return createNotification(userId, {
      type: "friend_request",
      title: "New friend request",
      message: `${requesterName} sent you a friend request`,
      senderId: requesterId
    });
  }
  
  // Create a mention notification
  export async function createMentionNotification(userId, mentionerId, groupId, groupName) {
    // Get mentioner details
    const mentionerRef = doc(db, "users", mentionerId);
    const mentionerDoc = await getDoc(mentionerRef);
    
    let mentionerName = "Someone";
    if (mentionerDoc.exists()) {
      mentionerName = mentionerDoc.data().displayName || mentionerDoc.data().username || "Someone";
    }
    
    return createNotification(userId, {
      type: "mention",
      title: "You were mentioned",
      message: `${mentionerName} mentioned you in ${groupName}`,
      senderId: mentionerId,
      groupId
    });
  }
  
  // Create a task notification (assignment or reminder)
  export async function createTaskNotification(userId, taskId, taskTitle, type = 'assignment') {
    return createNotification(userId, {
      type: type === 'assignment' ? "task_assignment" : "task_reminder",
      title: type === 'assignment' ? "New task assigned" : "Task reminder",
      message: type === 'assignment' ? 
        `You've been assigned a new task: ${taskTitle}` : 
        `Reminder: Task "${taskTitle}" is due soon`,
      taskId
    });
  }
  
  // Initialize notification listeners for the current user
  export function initializeNotificationListeners() {
    if (!auth.currentUser) {
      return;
    }
    
    // Listen for new messages that might need notifications
    const messagesQuery = query(
      collection(db, "messages"),
      where("participants", "array-contains", auth.currentUser.uid),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    
    const unsubMessages = onSnapshot(messagesQuery, async (snapshot) => {
      if (snapshot.empty) return;
      
      // Get the latest message
      const messageDoc = snapshot.docs[0];
      const message = messageDoc.data();
      
      // Only create notification if message is from someone else and user hasn't read it yet
      if (message.senderId !== auth.currentUser.uid && !message.readBy?.includes(auth.currentUser.uid)) {
        // Check user notification settings
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const shouldNotify = message.type === 'direct' ? 
            userData.settings?.notifications?.messages !== false : 
            userData.settings?.notifications?.groupMessages !== false;
          
          if (shouldNotify) {
            await createMessageNotification(
              auth.currentUser.uid,
              message.senderId,
              message.message,
              message.type
            );
          }
        }
      }
    });
    
    // Listen for incoming friend requests
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    const unsubUser = onSnapshot(userRef, async (doc) => {
      if (!doc.exists()) return;
      
      const userData = doc.data();
      const incomingRequests = userData.incomingFriendRequests || [];
      
      // Check if there are any new requests (this is simplified; in a real app you'd track which ones you've notified about)
      for (const request of incomingRequests) {
        // Check if we've created a notification for this request already
        const notifQuery = query(
          collection(db, "notifications"),
          where("userId", "==", auth.currentUser.uid),
          where("type", "==", "friend_request"),
          where("senderId", "==", request.userId)
        );
        
        const notifSnapshot = await getDocs(notifQuery);
        
        if (notifSnapshot.empty) {
          // No notification found, create one
          // Check notification settings first
          if (userData.settings?.notifications?.friendRequests !== false) {
            await createFriendRequestNotification(auth.currentUser.uid, request.userId);
          }
        }
      }
    });
    
    // Return a function to unsubscribe from all listeners
    return () => {
      unsubMessages();
      unsubUser();
    };
  }