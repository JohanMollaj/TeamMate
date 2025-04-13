import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    where, 
    getDoc,
    serverTimestamp,
    orderBy,
    onSnapshot
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  // Get tasks for current user
  export function getUserTasks(userId, callback) {
    const q = query(
      collection(db, "tasks"),
      where("assignedTo", "==", userId),
      orderBy("dueDate", "asc")
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      callback(tasks);
    });
  }
  
  // Create new task
  export async function createTask(taskData) {
    return addDoc(collection(db, "tasks"), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  // Update task
  export async function updateTask(taskId, taskData) {
    const taskRef = doc(db, "tasks", taskId);
    
    return updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp()
    });
  }
  
  // Delete task
  export async function deleteTask(taskId) {
    const taskRef = doc(db, "tasks", taskId);
    return deleteDoc(taskRef);
  }
  
  // Mark task as completed
  export async function completeTask(taskId, submissionData) {
    const taskRef = doc(db, "tasks", taskId);
    
    return updateDoc(taskRef, {
      completed: true,
      completedAt: serverTimestamp(),
      submission: submissionData,
      updatedAt: serverTimestamp()
    });
  }
  
  // Get task details
  export async function getTaskById(taskId) {
    const taskRef = doc(db, "tasks", taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (taskDoc.exists()) {
      return {
        id: taskDoc.id,
        ...taskDoc.data()
      };
    } else {
      return null;
    }
  }