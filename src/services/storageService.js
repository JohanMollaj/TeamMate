import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, auth, db } from '../firebase';

// Upload profile image and update user profile
export async function uploadProfileImage(file) {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }
  
  const user = auth.currentUser;
  const fileExtension = file.name.split('.').pop();
  const storageRef = ref(storage, `profile_images/${user.uid}.${fileExtension}`);
  
  // Upload the file
  await uploadBytes(storageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  // Update auth profile
  await updateProfile(user, {
    photoURL: downloadURL
  });
  
  // Update Firestore user document
  const userDocRef = doc(db, "users", user.uid);
  await updateDoc(userDocRef, {
    profilePicture: downloadURL
  });
  
  return downloadURL;
}

// Upload task attachment
export async function uploadTaskAttachment(taskId, file) {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }
  
  const user = auth.currentUser;
  const fileName = file.name;
  const storageRef = ref(storage, `task_attachments/${taskId}/${fileName}`);
  
  // Upload the file
  await uploadBytes(storageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  return {
    name: fileName,
    url: downloadURL,
    uploadedBy: user.uid,
    uploadedAt: new Date().toISOString()
  };
}