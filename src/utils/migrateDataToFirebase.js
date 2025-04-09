// src/utils/migrateDataToFirebase.js
import { db } from '../firebase/config';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Import your JSON data
import usersData from '/public/users.json';
import groupsData from '/public/groups.json';
import tasksData from '/public/tasks.json';
import gradedTasksData from '/public/gradedTasks.json';
import messagesData from '/public/messages.json';
import notificationsData from '/public/notifications.json';

const migrateUsers = async () => {
  console.log('Migrating users...');
  try {
    for (const user of usersData) {
      await setDoc(doc(db, 'users', user.id), {
        ...user,
        createdAt: serverTimestamp(),
        // Set default values for new fields if needed
      });
    }
    console.log('Users migration complete!');
  } catch (error) {
    console.error('Error migrating users:', error);
  }
};

const migrateGroups = async () => {
  console.log('Migrating groups...');
  try {
    for (const group of groupsData) {
      await setDoc(doc(db, 'groups', group.id), {
        ...group,
        description: group.description || '',
        createdBy: '1', // Default to user 1 for demo
        members: ['1', '2', '3'], // Sample members
        createdAt: serverTimestamp(),
      });
    }
    console.log('Groups migration complete!');
  } catch (error) {
    console.error('Error migrating groups:', error);
  }
};

const migrateTasks = async () => {
  console.log('Migrating tasks...');
  try {
    for (const task of tasksData.tasks) {
      await addDoc(collection(db, 'tasks'), {
        ...task,
        assignedTo: '1', // Default to user 1 for demo
        createdAt: serverTimestamp(),
        dueDate: new Date(task.dueDate), // Convert string to Date object
      });
    }
    console.log('Tasks migration complete!');
  } catch (error) {
    console.error('Error migrating tasks:', error);
  }
};

const migrateGradedTasks = async () => {
  console.log('Migrating graded tasks...');
  try {
    for (const task of gradedTasksData.gradedAssignments) {
      await addDoc(collection(db, 'gradedTasks'), {
        ...task,
        dateGraded: new Date(task.dateGraded), // Convert string to Date object
      });
    }
    console.log('Graded tasks migration complete!');
  } catch (error) {
    console.error('Error migrating graded tasks:', error);
  }
};

const migrateMessages = async () => {
  console.log('Migrating messages...');
  try {
    for (const message of messagesData) {
      const messageData = {
        senderId: message.senderID,
        type: message.type,
        content: message.message,
        createdAt: new Date(message.time),
        read: false,
      };
      
      // Add the appropriate ID field based on message type
      if (message.type === 'direct') {
        messageData.receiverId = message.receiverID;
      } else {
        messageData.groupId = message.groupID;
      }
      
      await addDoc(collection(db, 'messages'), messageData);
    }
    console.log('Messages migration complete!');
  } catch (error) {
    console.error('Error migrating messages:', error);
  }
};

const migrateNotifications = async () => {
  console.log('Migrating notifications...');
  try {
    // Notifications are stored by user ID in your JSON
    const notifData = notificationsData['1']; // Using user 1's notifications
    
    for (const notification of notifData) {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        userId: '1', // The user these notifications belong to
        time: new Date(notification.time), // Convert string to Date object
      });
    }
    console.log('Notifications migration complete!');
  } catch (error) {
    console.error('Error migrating notifications:', error);
  }
};

// Main migration function
export const migrateAllData = async () => {
  try {
    await migrateUsers();
    await migrateGroups();
    await migrateTasks();
    await migrateGradedTasks();
    await migrateMessages();
    await migrateNotifications();
    console.log('All data migration complete!');
  } catch (error) {
    console.error('Error during data migration:', error);
  }
};