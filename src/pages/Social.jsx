import './social.css';
import FriendsChatbox from '../components/FriendsChatbox';
import CreateGroupDialog from '../components/createGroupDialog';
import AddFriendDialog from '../components/addFriendDialog';

import { FaArrowRightArrowLeft, FaUserGroup, FaPlus, FaCheck} from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Helper function for generating initials
const getInitials = (name) => {
    if (!name) return "U";
    const words = name.split(' ');
    if (words.length === 1) {
        // Capitalize first letter, lowercase second letter
        return name.substring(0, 1).toUpperCase() + 
            (name.length > 1 ? name.substring(1, 2).toLowerCase() : "");
    } else {
        // First letter of first and last words, properly capitalized
        return words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
    }
};

// Define a set of darker pastel colors for better text readability
const pastelColors = [
    "#c25151", // red
    "#bd7d3c", // orange
    "#5db54c", // green
    "#4ea4a6", // light blue
    "#555b9e", // blue
    "#7e599c", // purple
];

// Generate consistent color based on name from predefined palette
const getConsistentColor = (name) => {
    if (!name) return pastelColors[0]; // Default to first color
    
    // Create a simple hash from the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Get a consistent index from the hash
    const index = Math.abs(hash) % pastelColors.length;
    
    // Return the color at that index
    return pastelColors[index];
};

// Function to truncate long names
const truncateName = (name, maxLength = 15) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
};

function Friends({ onSelectChat, allUsers, currentUser }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [friends, setFriends] = useState([]);
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
    const [friendRequests, setFriendRequests] = useState([]);
    const [showFriendRequests, setShowFriendRequests] = useState(false);

    useEffect(() => {
        if (currentUser) {
            const fetchFriends = () => {
                try {
                    // Get all users
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    
                    // Find the current user to get their friends list
                    const fullUserData = users.find(u => u.id === currentUser.id);
                    
                    if (fullUserData && fullUserData.friends) {
                        // Get friends data
                        const userFriends = users
                            .filter(u => fullUserData.friends.includes(u.id))
                            .map(friend => ({
                                id: friend.id,
                                name: friend.name,
                                username: friend.username,
                                profileImage: friend.profilePicture,
                                isOnline: friend.isOnline,
                                bio: friend.bio,
                                chatType: 'direct'
                            }));
                        
                        setFriends(userFriends);
                        
                        // Get friend requests
                        if (fullUserData.friendRequests && fullUserData.friendRequests.length > 0) {
                            const requests = users
                                .filter(u => fullUserData.friendRequests.includes(u.id))
                                .map(user => ({
                                    id: user.id,
                                    name: user.name,
                                    username: user.username,
                                    profileImage: user.profilePicture
                                }));
                            
                            setFriendRequests(requests);
                        }
                    }
                } catch (error) {
                    console.error("Error loading friends:", error);
                    setFriends([]);
                }
            };
            
            fetchFriends();
        }
    }, [currentUser]);

    const handleSendRequest = async (username) => {
        try {
            // Get all users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Find target user by username
            const targetUser = users.find(u => u.username === username);
            
            if (!targetUser) {
                throw new Error(`User @${username} not found.`);
            }
            
            if (targetUser.id === currentUser.id) {
                throw new Error("You can't send a friend request to yourself.");
            }
            
            // Check if already friends
            const currentUserData = users.find(u => u.id === currentUser.id);
            if (currentUserData.friends.includes(targetUser.id)) {
                throw new Error(`You are already friends with @${username}.`);
            }
            
            // Check if friend request already sent
            if (targetUser.friendRequests && targetUser.friendRequests.includes(currentUser.id)) {
                throw new Error(`Friend request already sent to @${username}.`);
            }
            
            // Add friend request
            const updatedUsers = users.map(u => {
                if (u.id === targetUser.id) {
                    return {
                        ...u,
                        friendRequests: [...(u.friendRequests || []), currentUser.id]
                    };
                }
                return u;
            });
            
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            // Create notification for the target user
            const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
            
            if (!notifications[targetUser.id]) {
                notifications[targetUser.id] = [];
            }
            
            // Add friend request notification
            notifications[targetUser.id].unshift({
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'friend_request',
                title: 'New Friend Request',
                message: `${currentUser.name} (@${currentUser.username}) sent you a friend request.`,
                time: new Date().toISOString(),
                read: false,
                senderId: currentUser.id
            });
            
            localStorage.setItem('notifications', JSON.stringify(notifications));
            
            return true;
        } catch (error) {
            console.error("Error sending friend request:", error);
            throw error;
        }
    };
    
    const handleAcceptFriendRequest = (requestUserId) => {
        try {
            // Get all users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Find both users
            const currentUserData = users.find(u => u.id === currentUser.id);
            const requestUserData = users.find(u => u.id === requestUserId);
            
            if (!currentUserData || !requestUserData) {
                throw new Error("User data not found");
            }
            
            // Update friends lists and remove the request
            const updatedUsers = users.map(u => {
                if (u.id === currentUser.id) {
                    return {
                        ...u,
                        friends: [...(u.friends || []), requestUserId],
                        friendRequests: (u.friendRequests || []).filter(id => id !== requestUserId)
                    };
                }
                if (u.id === requestUserId) {
                    return {
                        ...u,
                        friends: [...(u.friends || []), currentUser.id]
                    };
                }
                return u;
            });
            
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            // Add notification for the request sender
            const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
            
            if (!notifications[requestUserId]) {
                notifications[requestUserId] = [];
            }
            
            notifications[requestUserId].unshift({
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'friend_accepted',
                title: 'Friend Request Accepted',
                message: `${currentUser.name} accepted your friend request.`,
                time: new Date().toISOString(),
                read: false,
                senderId: currentUser.id
            });
            
            localStorage.setItem('notifications', JSON.stringify(notifications));
            
            // Update the local state
            setFriendRequests(prev => prev.filter(req => req.id !== requestUserId));
            
            // Add the new friend to the friends list
            const newFriend = {
                id: requestUserData.id,
                name: requestUserData.name,
                username: requestUserData.username,
                profileImage: requestUserData.profilePicture,
                isOnline: requestUserData.isOnline,
                bio: requestUserData.bio,
                chatType: 'direct'
            };
            
            setFriends(prev => [...prev, newFriend]);
            
            return true;
        } catch (error) {
            console.error("Error accepting friend request:", error);
            return false;
        }
    };
    
    const handleDeclineFriendRequest = (requestUserId) => {
        try {
            // Get all users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Remove the request
            const updatedUsers = users.map(u => {
                if (u.id === currentUser.id) {
                    return {
                        ...u,
                        friendRequests: (u.friendRequests || []).filter(id => id !== requestUserId)
                    };
                }
                return u;
            });
            
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            // Update the local state
            setFriendRequests(prev => prev.filter(req => req.id !== requestUserId));
            
            return true;
        } catch (error) {
            console.error("Error declining friend request:", error);
            return false;
        }
    };

    const filteredFriends = friends.filter((friend) => {
        const matchesSearch = friend.name.toLowerCase().includes(search.toLowerCase()) || 
                             friend.username.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filter === "all" ||
            (filter === "online" && friend.isOnline) ||
            (filter === "offline" && !friend.isOnline);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className='friends-list-container'>
            <h3 id="filter-status">Showing: </h3>
            <div className="filter-group">
                <button className={`filterOption ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}>All</button>
                <button className={`filterOption ${filter === "online" ? "active" : ""}`}
                    onClick={() => setFilter("online")}>Online</button>
                <button className={`filterOption ${filter === "offline" ? "active" : ""}`}
                    onClick={() => setFilter("offline")}>Offline</button>
            </div>
            <div className='search-box'>
                <input
                    placeholder="Search friends..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="textarea"
                />
            </div>

            <div className="friends mb-5">
                <button 
                onClick={() => setIsAddFriendOpen(true)}
                className="text-[18px] text-white flex items-center rounded-lg bg-green-700 p-3 w-full min-w-[230px] items-center justify-center
                transition duration-200 ease-in-out hover:bg-green-800">
                    Add Friend
                </button>

                {friendRequests.length > 0 && (
                    <button 
                    onClick={() => setShowFriendRequests(!showFriendRequests)}
                    className="text-[18px] text-white flex items-center rounded-lg bg-blue-700 p-3 w-full min-w-[230px] items-center justify-center
                    transition duration-200 ease-in-out hover:bg-blue-800 mt-2">
                        {showFriendRequests ? 'Hide' : 'Show'} Friend Requests ({friendRequests.length})
                    </button>
                )}

                <AddFriendDialog
                    isOpen={isAddFriendOpen}
                    onClose={() => setIsAddFriendOpen(false)}
                    onSendRequest={handleSendRequest}
                />

                {/* Friend requests section */}
                {showFriendRequests && friendRequests.length > 0 && (
                    <div className="friend-requests-section mt-4 mb-4">
                        <h4 className="text-lg mb-2">Friend Requests</h4>
                        {friendRequests.map((request) => (
                            <div key={request.id} className="friend-request-item">
                                <div className="friend-info">
                                    {request.profileImage ? (
                                        <img src={request.profileImage} alt={request.name} className="friend-avatar" />
                                    ) : (
                                        <div 
                                            className="friend-avatar initials-avatar"
                                            style={{ backgroundColor: getConsistentColor(request.name) }}
                                        >
                                            {getInitials(request.name)}
                                        </div>
                                    )}
                                    <div className="friend-details">
                                        <span className="friend-username">{request.name}</span>
                                        <span className="friend-username-small">@{request.username}</span>
                                    </div>
                                </div>
                                <div className="friend-request-actions">
                                    <button 
                                        className="accept-button"
                                        onClick={() => handleAcceptFriendRequest(request.id)}
                                    >
                                        <FaCheck />
                                    </button>
                                    <button 
                                        className="decline-button"
                                        onClick={() => handleDeclineFriendRequest(request.id)}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredFriends.map((friend) => (
                    <button
                        key={friend.id}
                        className="friend-button"
                        onClick={() => onSelectChat(friend)}>
                        <div className="friend">
                            {friend.profileImage ? (
                                <img src={friend.profileImage} alt={friend.name} className="friend-avatar" />
                            ) : (
                                <div 
                                    className="friend-avatar initials-avatar"
                                    style={{ backgroundColor: getConsistentColor(friend.name) }}
                                >
                                    {getInitials(friend.name)}
                                </div>
                            )}
                            <span className={`status-indicator ${friend.isOnline ? "online" : "offline"}`}></span>
                            <span className="friend-username">{truncateName(friend.name)}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function Groups({ onSelectChat, allUsers, currentUser }) {
    const [search, setSearch] = useState("");
    const [groups, setGroups] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCreateGroup = (groupData) => {
<<<<<<< Updated upstream:src/pages/Social.js
        try {
            // Create a new group with members and add to the state
            const newGroup = {
                id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
                name: groupData.name,
                description: groupData.description,
                chatType: 'group', // Important: Set the chat type explicitly
                members: groupData.members || [currentUser.id], // Include current user by default
                createdBy: currentUser.id, // Current user created the group
                createdAt: new Date().toISOString()
            };
            
            setGroups(prevGroups => [...prevGroups, newGroup]);
            
            // Save to localStorage or send to backend
            const savedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
            localStorage.setItem('groups', JSON.stringify([...savedGroups, newGroup]));
            
            return newGroup;
        } catch (error) {
            console.error("Error creating group:", error);
            return null;
        }
    };

    useEffect(() => {
        if (currentUser) {
            // Get groups from localStorage
            const fetchGroups = () => {
                try {
                    const savedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
                    
                    // Filter groups where the current user is a member
                    const userGroups = savedGroups.filter(group => {
                        return group.members && group.members.includes(currentUser.id);
                    });
                    
                    setGroups(userGroups);
                } catch (error) {
                    console.error("Error loading groups:", error);
                    setGroups([]);
                }
            };
            
            fetchGroups();
        }
    }, [currentUser]);
=======
        console.log('Creating group:', groupData);
        // Create a new group with members and add to the state
        const newGroup = {
            id: `group_${Date.now()}`, // Generate unique ID
            name: groupData.name,
            description: groupData.description,
            chatType: 'group', // Important: Set the chat type explicitly
            members: groupData.members || ["1"], // Include current user by default
            createdBy: "1", // Current user created the group
            createdAt: new Date().toISOString()
        };
        
        setGroups(prevGroups => [...prevGroups, newGroup]);
        
        // Save to localStorage or send to backend
        const savedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
        localStorage.setItem('groups', JSON.stringify([...savedGroups, newGroup]));
    };

    useEffect(() => {
        // First try to get from localStorage
        const savedGroups = localStorage.getItem('groups');
        if (savedGroups) {
            setGroups(JSON.parse(savedGroups));
        } else {
            // Otherwise fetch from JSON file
            fetch("/groups.json")
                .then(response => response.json())
                .then(data => {
                    // Add chatType and other necessary group fields
                    const groupsWithChatType = data.map(group => ({
                        ...group,
                        chatType: 'group', // Important: Set the chat type explicitly
                        members: ["1", "2", "3"], // Sample members - would come from backend in real app
                        createdBy: "1", // Sample creator
                        createdAt: new Date().toISOString()
                    }));
                    setGroups(groupsWithChatType);
                    localStorage.setItem('groups', JSON.stringify(groupsWithChatType));
                })
                .catch(error => {
                    console.error("Error loading groups:", error);
                    // Initialize with empty array if fetch fails
                    setGroups([]);
                });
        }
    }, []);
>>>>>>> Stashed changes:src/pages/Social.jsx

    const filteredGroups = groups.filter((group) => {
        const matchesSearch = group.name.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });
    
    return (
        <div className='friends-list-container'>
            <div className='search-box'>
                <input
                    placeholder="Search groups..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="textarea"
                />
            </div>
                <div className="friends">
                    <button 
                    onClick={() => setIsDialogOpen(true)}
                    className="text-[18px] text-white flex gap-2 items-center rounded-lg bg-slate-500 p-3 w-full min-w-[230px] items-center justify-center
                    transition duration-200 ease-in-out hover:bg-slate-600 mb-4">
                        <FaPlus /> Create Group
                    </button>
                    
                    {filteredGroups.length === 0 ? (
                        <div className="no-groups-message">
                            <p>You don't have any groups yet.</p>
                            <p>Create a new group or join an existing one!</p>
                        </div>
                    ) : (
                        filteredGroups.map((group) => (
                            <button
                                key={group.id}
                                className="friend-button"
                                onClick={() => onSelectChat(group)}>
                                <div className="friend">
                                    {group.groupImage ? (
                                        <img src={group.groupImage} alt={group.name} className="friend-avatar" />
                                    ) : (
                                        <div 
                                            className="friend-avatar initials-avatar"
                                            style={{ backgroundColor: getConsistentColor(group.name) }}
                                        >
                                            {getInitials(group.name)}
                                        </div>
                                    )}
                                    <span className="friend-username">{truncateName(group.name)}</span>
                                    <span className="member-count">
                                        {group.members?.length || 0} members
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                    
                    <CreateGroupDialog
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                        onCreateGroup={handleCreateGroup}
                    />  
                </div>
        </div>
    );
}

const Social = () => {
    const location = useLocation();
    const [activeChat, setActiveChat] = useState(null);
    const [activeTab, setActiveTab] = useState("Friends");
    const [allUsers, setAllUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    
    useEffect(() => {
        // Get current user from localStorage
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            setCurrentUser(user);
        }
        
        // Load all users for reference (needed for displaying sender names in group chats)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        setAllUsers(users);
    }, []);
<<<<<<< Updated upstream:src/pages/Social.js
=======
    
    useEffect(() => {
        // Load all users for reference (needed for displaying sender names in group chats)
        fetch("/friends.json")
            .then(response => response.json())
            .then(data => {
                setAllUsers(data);
            });
    }, []);
>>>>>>> Stashed changes:src/pages/Social.jsx

    useEffect(() => {
        // Handle user passed from dashboard
        if (location.state?.user) {
            const user = {
                ...location.state.user,
                chatType: location.state.user.chatType || 'direct' // Ensure chatType is set
            };
            setActiveChat(user);
            localStorage.setItem("activeChat", JSON.stringify(user));
        } else {
            // If no user passed, check localStorage
            const savedChat = localStorage.getItem("activeChat");
            if (savedChat) {
                setActiveChat(JSON.parse(savedChat));
            }
        }
    }, [location.state]);

    const handleChatSelect = (chat) => {
        setActiveChat(chat);
        localStorage.setItem("activeChat", JSON.stringify(chat)); // Save the chat
    };

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const setTab = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div className="container-friends">
            <div className="friends-menu">
                <div className="filter-container">
                    <h1>{activeTab}</h1>
                    <div className="tab-buttons">
                        <button 
                            className={`tab-button ${activeTab === "Friends" ? "active" : ""}`}
                            onClick={() => setTab("Friends")}>
                            Friends
                        </button>
                        <button 
                            className={`tab-button ${activeTab === "Groups" ? "active" : ""}`}
                            onClick={() => setTab("Groups")}>
                            Groups
                        </button>
                    </div>
                </div>
                {currentUser ? (
                    activeTab === "Friends" ? 
                    <Friends onSelectChat={handleChatSelect} allUsers={allUsers} currentUser={currentUser} /> : 
                    <Groups onSelectChat={handleChatSelect} allUsers={allUsers} currentUser={currentUser} />
                ) : (
                    <div className="loading-container">Loading...</div>
                )}
            </div>
    
            {activeChat && currentUser && (
                <FriendsChatbox activeChat={activeChat} allUsers={allUsers} currentUser={currentUser} />
            )}
        </div>
    );
};

export default Social;