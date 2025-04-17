import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  onSnapshot,
  Timestamp
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
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date
      dueDate: doc.data().dueDate instanceof Timestamp ? 
        doc.data().dueDate.toDate().toISOString() : 
        doc.data().dueDate
    }));
    
    callback(tasks);
  });
}

// Get all tasks assigned by a specific user
export function getAssignedTasks(assignedById, callback) {
  const q = query(
    collection(db, "tasks"),
    where("assignedBy", "==", assignedById),
    orderBy("dueDate", "asc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate instanceof Timestamp ? 
        doc.data().dueDate.toDate().toISOString() : 
        doc.data().dueDate
    }));
    
    callback(tasks);
  });
}

// Get tasks for a specific group
export function getGroupTasks(groupId, callback) {
  const q = query(
    collection(db, "tasks"),
    where("groupId", "==", groupId),
    orderBy("dueDate", "asc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate instanceof Timestamp ? 
        doc.data().dueDate.toDate().toISOString() : 
        doc.data().dueDate
    }));
    
    callback(tasks);
  });
}

// Create new task
export async function createTask(taskData) {
  // Convert string date to Firestore Timestamp
  const firestoreTaskData = {
    ...taskData,
    dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  return addDoc(collection(db, "tasks"), firestoreTaskData);
}

// Update task
export async function updateTask(taskId, taskData) {
  const taskRef = doc(db, "tasks", taskId);
  
  // Handle date conversion if present
  const updateData = { ...taskData, updatedAt: serverTimestamp() };
  if (taskData.dueDate) {
    updateData.dueDate = Timestamp.fromDate(new Date(taskData.dueDate));
  }
  
  return updateDoc(taskRef, updateData);
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
    const data = taskDoc.data();
    return {
      id: taskDoc.id,
      ...data,
      dueDate: data.dueDate instanceof Timestamp ? 
        data.dueDate.toDate().toISOString() : 
        data.dueDate
    };
  } else {
    return null;
  }
}

// Get graded tasks for a user
export function getGradedTasks(userId, callback) {
  const q = query(
    collection(db, "gradedTasks"),
    where("userId", "==", userId),
    orderBy("dateGraded", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateGraded: doc.data().dateGraded instanceof Timestamp ? 
        doc.data().dateGraded.toDate().toISOString() : 
        doc.data().dateGraded
    }));
    
    callback(tasks);
  });
}

// Get graded tasks for a specific group
export function getGroupGradedTasks(groupId, callback) {
  const q = query(
    collection(db, "gradedTasks"),
    where("groupId", "==", groupId),
    orderBy("dateGraded", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateGraded: doc.data().dateGraded instanceof Timestamp ? 
        doc.data().dateGraded.toDate().toISOString() : 
        doc.data().dateGraded
    }));
    
    callback(tasks);
  });
}

// Create a graded task record
export async function addGradedTask(taskData) {
  // Convert string date to Firestore Timestamp
  const firestoreTaskData = {
    ...taskData,
    dateGraded: taskData.dateGraded ? Timestamp.fromDate(new Date(taskData.dateGraded)) : serverTimestamp()
  };
  
  return addDoc(collection(db, "gradedTasks"), firestoreTaskData);
}

// Update a graded task
export async function updateGradedTask(taskId, taskData) {
  const taskRef = doc(db, "gradedTasks", taskId);
  
  // Handle date conversion if present
  const updateData = { ...taskData };
  if (taskData.dateGraded) {
    updateData.dateGraded = Timestamp.fromDate(new Date(taskData.dateGraded));
  }
  
  return updateDoc(taskRef, updateData);
}

// Delete a graded task
export async function deleteGradedTask(taskId) {
  const taskRef = doc(db, "gradedTasks", taskId);
  return deleteDoc(taskRef);
}

// Initialize demo tasks if needed (for testing or new user setup)
export async function initializeDemoTasks(userId) {
  // First check if user already has tasks
  const existingTasksQuery = query(
    collection(db, "tasks"),
    where("assignedTo", "==", userId),
    limit(1)
  );
  
  const snapshot = await getDocs(existingTasksQuery);
  if (!snapshot.empty) {
    // User already has tasks, no need to initialize
    return;
  }
  
  // Sample tasks
  const demoTasks = [
    {
      title: "Complete Project Proposal",
      description: "Write and submit the Q1 project proposal",
      dueDate: Timestamp.fromDate(new Date(Date.now() + 86400000 * 2)), // 2 days from now
      assignedBy: userId,
      assignedTo: userId,
      completed: false
    },
    {
      title: "Review Team Presentations",
      description: "Review and provide feedback on team presentations",
      dueDate: Timestamp.fromDate(new Date(Date.now() + 86400000 * 10)), // 10 days from now
      assignedBy: userId,
      assignedTo: userId,
      completed: false
    },
    {
      title: "Weekly Report",
      description: "Submit weekly progress report",
      dueDate: Timestamp.fromDate(new Date(Date.now() - 86400000 * 2)), // 2 days ago
      assignedBy: userId,
      assignedTo: userId,
      completed: true,
      completedAt: Timestamp.fromDate(new Date(Date.now() - 86400000 * 3))
    }
  ];
  
  // Add each task to Firestore
  const promises = demoTasks.map(task => 
    addDoc(collection(db, "tasks"), {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  );
  
  return Promise.all(promises);
}