// src/firebase/storage.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Upload profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    const storageRef = ref(storage, `profilePictures/${userId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

// Upload task attachment
export const uploadTaskAttachment = async (taskId, file) => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `taskAttachments/${taskId}/${fileName}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return {
      name: file.name,
      url: downloadURL,
      type: file.type,
      size: file.size
    };
  } catch (error) {
    throw error;
  }
};

// Delete file
export const deleteFile = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    throw error;
  }
};