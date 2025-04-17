import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const UserContext = createContext();

// Custom hook for using the context
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  
  // Load all users and groups on initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch('/users.json');
        const usersData = await usersResponse.json();
        setAllUsers(usersData);
        
        // Fetch groups
        const groupsResponse = await fetch('/groups.json');
        const groupsData = await groupsResponse.json();
        setAllGroups(groupsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Function to log in a user
  const login = (email, password) => {
    const user = allUsers.find(user => 
      user.email === email && user.password === password
    );
    
    if (user) {
      // Set the current user
      setCurrentUser(user);
      return true;
    }
    return false;
  };
  
  // Function to log out
  const logout = () => {
    setCurrentUser(null);
  };
  
  // Get user's friends with full details
  const getUserFriends = () => {
    if (!currentUser) return [];
    
    return currentUser.friends.map(friendId => 
      allUsers.find(user => user.id === friendId)
    ).filter(Boolean); // Filter out any undefined values
  };
  
  // Get user's groups with full details
  const getUserGroups = () => {
    if (!currentUser) return [];
    
    return currentUser.groups.map(groupId => 
      allGroups.find(group => group.id === groupId)
    ).filter(Boolean);
  };
  
  // Add a friend
  const addFriend = (friendId) => {
    if (!currentUser) return false;
    
    // Check if the friend ID is valid
    const friendExists = allUsers.some(user => user.id === friendId);
    if (!friendExists) return false;
    
    // Check if already a friend
    if (currentUser.friends.includes(friendId)) return true;
    
    // Update the current user's friends list
    const updatedUser = {
      ...currentUser,
      friends: [...currentUser.friends, friendId]
    };
    setCurrentUser(updatedUser);
    
    // Update the allUsers state
    const updatedUsers = allUsers.map(user => 
      user.id === currentUser.id ? updatedUser : user
    );
    setAllUsers(updatedUsers);
    
    // In a real app, you would also make an API call to update the database
    return true;
  };
  
  // Remove a friend
  const removeFriend = (friendId) => {
    if (!currentUser) return false;
    
    // Update the current user's friends list
    const updatedUser = {
      ...currentUser,
      friends: currentUser.friends.filter(id => id !== friendId)
    };
    setCurrentUser(updatedUser);
    
    // Update the allUsers state
    const updatedUsers = allUsers.map(user => 
      user.id === currentUser.id ? updatedUser : user
    );
    setAllUsers(updatedUsers);
    
    // In a real app, you would also make an API call to update the database
    return true;
  };
  
  // Join a group
  const joinGroup = (groupId) => {
    if (!currentUser) return false;
    
    // Check if the group ID is valid
    const groupExists = allGroups.some(group => group.id === groupId);
    if (!groupExists) return false;
    
    // Check if already a member
    if (currentUser.groups.includes(groupId)) return true;
    
    // Update the current user's groups list
    const updatedUser = {
      ...currentUser,
      groups: [...currentUser.groups, groupId]
    };
    setCurrentUser(updatedUser);
    
    // Update the allUsers state
    const updatedUsers = allUsers.map(user => 
      user.id === currentUser.id ? updatedUser : user
    );
    setAllUsers(updatedUsers);
    
    // Update the group's members list
    const updatedGroups = allGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: [...group.members, currentUser.id]
        };
      }
      return group;
    });
    setAllGroups(updatedGroups);
    
    // In a real app, you would also make API calls to update the database
    return true;
  };
  
  // Leave a group
  const leaveGroup = (groupId) => {
    if (!currentUser) return false;
    
    // Update the current user's groups list
    const updatedUser = {
      ...currentUser,
      groups: currentUser.groups.filter(id => id !== groupId)
    };
    setCurrentUser(updatedUser);
    
    // Update the allUsers state
    const updatedUsers = allUsers.map(user => 
      user.id === currentUser.id ? updatedUser : user
    );
    setAllUsers(updatedUsers);
    
    // Update the group's members list
    const updatedGroups = allGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.filter(id => id !== currentUser.id),
          // Also remove from admins if the user is an admin
          admins: group.admins.filter(id => id !== currentUser.id)
        };
      }
      return group;
    });
    setAllGroups(updatedGroups);
    
    // In a real app, you would also make API calls to update the database
    return true;
  };
  
  const value = {
    currentUser,
    isLoading,
    allUsers,
    allGroups,
    login,
    logout,
    getUserFriends,
    getUserGroups,
    addFriend,
    removeFriend,
    joinGroup,
    leaveGroup
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;