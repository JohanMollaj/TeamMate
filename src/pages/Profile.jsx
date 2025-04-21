// ProfileCard.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Profile = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    username: '',
    bio: '',
    qualifications: ''
  });
  
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    qualifications: ''
  });

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 1).toUpperCase() + 
        (name.length > 1 ? name.substring(1, 2).toLowerCase() : "");
    } else {
      return words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
    }
  };

  // Generate consistent background color for avatar
  const getConsistentColor = (name) => {
    const pastelColors = [
      "#c25151", // red
      "#bd7d3c", // orange
      "#5db54c", // green
      "#4ea4a6", // light blue
      "#555b9e", // blue
      "#7e599c", // purple
    ];
    
    if (!name) return pastelColors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % pastelColors.length;
    return pastelColors[index];
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchProfileData();
    }
  }, [isOpen, currentUser]);

  async function fetchProfileData() {
    if (currentUser) {
      try {
        // First try to get data from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          const profileInfo = {
            displayName: userData.displayName || '',
            username: userData.username || '',
            bio: userData.bio || '',
            qualifications: userData.qualifications || ''
          };
          
          setProfileData(profileInfo);
          setFormData(profileInfo);
        } else {
          // Fallback to users.json if no Firestore data exists
          try {
            const response = await fetch("/users.json");
            const usersData = await response.json();
            
            // Try to find a matching user by email or username
            const matchingUser = usersData.find(user => 
              user.email === currentUser.email || 
              user.username === currentUser.username
            );
            
            if (matchingUser) {
              const profileInfo = {
                displayName: currentUser.displayName || '',
                username: currentUser.email?.split('@')[0] || '',
                bio: matchingUser.bio || '',
                qualifications: matchingUser.qualifications || ''
              };
              
              setProfileData(profileInfo);
              setFormData(profileInfo);
            }
          } catch (jsonError) {
            console.error("Error fetching from users.json:", jsonError);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data. Please try again later.");
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        
        await updateDoc(userDocRef, {
          displayName: formData.displayName,
          username: formData.username,
          bio: formData.bio,
          qualifications: formData.qualifications
        });
        
        setProfileData(formData);
        setIsEditing(false);
        onClose(); // Close the modal on success
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
      onClick={closeModal}
    >
      <div className="w-full h-[85%] max-w-md bg-[var(--bg-secondary)] pl-2 rounded-xl shadow-lg overflow-auto 
                      [&::-webkit-scrollbar]:w-2">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 m-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3"
              style={{ 
                backgroundColor: getConsistentColor(profileData.displayName),
                backgroundImage: currentUser?.photoURL ? `url(${currentUser.photoURL})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!currentUser?.photoURL && getInitials(profileData.displayName)}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-[var(--button-active)]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1 transform text-[var(--text-secondary)]">
                  @
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-8 pr-5 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-[var(--button-active)]"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                About Me
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-[var(--bg-input)] resize-none border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-[var(--button-active)]"
                placeholder="Tell us about yourself"
              />
            </div>
            
            <div>
              <label htmlFor="qualifications" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Qualifications
              </label>
              <textarea
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-[var(--bg-input)] resize-none border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-[var(--button-active)]"
                placeholder="List your skills and qualifications"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--hover-color)] transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-[var(--button-active)] text-white rounded-lg hover:bg-[var(--sidebar-button)] transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;