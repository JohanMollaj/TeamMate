import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// Get all groups for the current user
export function getUserGroups(callback) {
  if (!auth.currentUser) {
    console.error("getUserGroups: No authenticated user!"); // Add check
    callback([]); // Return empty if no user
    return () => {}; 
  }
  
  console.log("Fetching groups for user:", auth.currentUser.uid); // Add for debugging
  const q = query(
    collection(db, "groups"),
    where("members", "array-contains", auth.currentUser.uid), // Ensure this ID is correct
    orderBy("name", "asc") 
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const groups = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    callback(groups);
  });
}

// Get a specific group by ID
export async function getGroupById(groupId) {
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  
  if (!groupDoc.exists()) {
    return null;
  }
  
  return {
    id: groupDoc.id,
    ...groupDoc.data()
  };
}

// Create a new group
export async function createGroup(groupData) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }
  
  // Generate a unique invite code if not provided
  if (!groupData.inviteCode) {
    groupData.inviteCode = generateInviteCode();
  }
  
  // Add current user as creator and member
  const newGroup = {
    ...groupData,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    members: [...(groupData.members || []), auth.currentUser.uid],
    admins: [auth.currentUser.uid]
  };
  
  console.log("Saving group with members:", newGroup.members); // Add for debugging
  return addDoc(collection(db, "groups"), newGroup);
}

// Update group details
export async function updateGroup(groupId, groupData) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }
  
  // Check if user is allowed to update (admin or creator)
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  
  if (!groupDoc.exists()) {
    throw new Error("Group not found");
  }
  
  const groupInfo = groupDoc.data();
  
  if (!groupInfo.admins.includes(auth.currentUser.uid) && groupInfo.createdBy !== auth.currentUser.uid) {
    throw new Error("You don't have permission to update this group");
  }
  
  return updateDoc(groupRef, {
    ...groupData,
    updatedAt: serverTimestamp()
  });
}

// Delete a group
export async function deleteGroup(groupId) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }
  
  // Check if user is the creator
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  
  if (!groupDoc.exists()) {
    throw new Error("Group not found");
  }
  
  if (groupDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error("Only the group creator can delete this group");
  }
  
  return deleteDoc(groupRef);
}

// Join a group using invite code
export async function joinGroupWithCode(inviteCode) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }
  
  // Find group with this invite code
  const q = query(
    collection(db, "groups"),
    where("inviteCode", "==", inviteCode)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error("Invalid invite code");
  }
  
  const groupDoc = querySnapshot.docs[0];
  const groupRef = doc(db, "groups", groupDoc.id);
  const groupData = groupDoc.data();
  
  // Check if user is already a member
  if (groupData.members.includes(auth.currentUser.uid)) {
    throw new Error("You are already a member of this group");
  }
  
  // Add user to members
  return updateDoc(groupRef, {
    members: arrayUnion(auth.currentUser.uid),
    updatedAt: serverTimestamp()
  });
}

// Leave a group
export async function leaveGroup(groupId) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }
  
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  
  if (!groupDoc.exists()) {
    throw new Error("Group not found");
  }
  
  const groupData = groupDoc.data();
  
  // If user is the creator, they can't leave - they must delete or transfer ownership
  if (groupData.createdBy === auth.currentUser.uid) {
    throw new Error("As the creator, you cannot leave the group. Transfer ownership or delete the group.");
  }
  
  // Remove user from members and admins if applicable
  await updateDoc(groupRef, {
    members: arrayRemove(auth.currentUser.uid),
    admins: arrayRemove(auth.currentUser.uid),
    updatedAt: serverTimestamp()
  });
  
  return true;
}

// Add user to group (admin function)
export async function addUserToGroup(groupId, userId) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }
  
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  
  if (!groupDoc.exists()) {
    throw new Error("Group not found");
  }
  
  const groupData = groupDoc.data();
  
  // Check if current user is admin or creator
  if (!groupData.admins.includes(auth.currentUser.uid) && groupData.createdBy !== auth.currentUser.uid) {
    throw new Error("You don't have permission to add users to this group");
  }
  
  // Check if user is already a member
  if (groupData.members.includes(userId)) {
    throw new Error("User is already a member of this group");
  }
  
  return updateDoc(groupRef, {
    members: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
}

// Remove user from group (admin function)
export async function removeUserFromGroup(groupId, userId) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }
  
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  
  if (!groupDoc.exists()) {
    throw new Error("Group not found");
  }
  
  const groupData = groupDoc.data();
  
  // Check if current user is admin or creator
  if (!groupData.admins.includes(auth.currentUser.uid) && groupData.createdBy !== auth.currentUser.uid) {
    throw new Error("You don't have permission to remove users from this group");
  }
  
  // Cannot remove the creator
  if (userId === groupData.createdBy) {
    throw new Error("Cannot remove the group creator");
  }
  
  return updateDoc(groupRef, {
    members: arrayRemove(userId),
    admins: arrayRemove(userId), // Also remove from admins if they were one
    updatedAt: serverTimestamp()
  });
}

// Make user an admin
export async function makeUserAdmin(groupId, userId) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }
  
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  
  if (!groupDoc.exists()) {
    throw new Error("Group not found");
  }
  
  const groupData = groupDoc.data();
  
  // Check if current user is the creator
  if (groupData.createdBy !== auth.currentUser.uid) {
    throw new Error("Only the group creator can assign admins");
  }
  
  // Check if user is a member
  if (!groupData.members.includes(userId)) {
    throw new Error("User must be a member of the group to be made an admin");
  }
  
  // Check if user is already an admin
  if (groupData.admins.includes(userId)) {
    throw new Error("User is already an admin");
  }
  
  return updateDoc(groupRef, {
    admins: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
}

// Remove admin privileges
export async function removeAdminPrivileges(groupId, userId) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }
  
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  
  if (!groupDoc.exists()) {
    throw new Error("Group not found");
  }
  
  const groupData = groupDoc.data();
  
  // Check if current user is the creator
  if (groupData.createdBy !== auth.currentUser.uid) {
    throw new Error("Only the group creator can remove admin privileges");
  }
  
  // Cannot remove creator's admin status
  if (userId === groupData.createdBy) {
    throw new Error("Cannot remove admin privileges from the creator");
  }
  
  return updateDoc(groupRef, {
    admins: arrayRemove(userId),
    updatedAt: serverTimestamp()
  });
}

// Get all members of a group with their details
export async function getGroupMembers(groupId) {
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  
  if (!groupDoc.exists()) {
    throw new Error("Group not found");
  }
  
  const groupData = groupDoc.data();
  const memberIds = groupData.members || [];
  
  if (memberIds.length === 0) {
    return [];
  }
  
  // Fetch member details in batches of 10
  const members = [];
  for (let i = 0; i < memberIds.length; i += 10) {
    const batch = memberIds.slice(i, i + 10);
    const memberPromises = batch.map(async (id) => {
      const userRef = doc(db, "users", id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data(),
          isAdmin: groupData.admins.includes(id),
          isCreator: groupData.createdBy === id
        };
      }
      
      return null;
    });
    
    const memberResults = await Promise.all(memberPromises);
    members.push(...memberResults.filter(Boolean));
  }
  
  return members;
}

// Generate a random invite code
function generateInviteCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Initialize demo groups if needed (for testing or new user setup)
export async function initializeDemoGroups(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  // Check if user already has groups
  const existingGroupsQuery = query(
    collection(db, "groups"),
    where("members", "array-contains", userId),
    limit(1)
  );
  
  const snapshot = await getDocs(existingGroupsQuery);
  if (!snapshot.empty) {
    // User already has groups, no need to initialize
    return;
  }
  
  // Sample groups
  const demoGroups = [
    {
      name: "Design Team",
      description: "Team focused on UI/UX design for the project",
      inviteCode: generateInviteCode(),
      createdBy: userId,
      members: [userId],
      admins: [userId]
    },
    {
      name: "Development Team",
      description: "Frontend and backend development team",
      inviteCode: generateInviteCode(),
      createdBy: userId,
      members: [userId],
      admins: [userId]
    }
  ];
  
  // Add each group to Firestore
  const promises = demoGroups.map(group => 
    addDoc(collection(db, "groups"), {
      ...group,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  );
  
  return Promise.all(promises);
}