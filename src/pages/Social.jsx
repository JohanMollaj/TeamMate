import './social.css';
import FriendsChatbox from '../components/FriendsChatbox';
import CreateGroupDialog from '../components/createGroupDialog';
import AddFriendDialog from '../components/addFriendDialog';

import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { FaUserGroup, FaPlus } from "react-icons/fa6";
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { findUserByUsername, sendFriendRequest, getUserFriends } from '../services/userService'; // Import necessary service functions
import { getGroupById, getUserGroups } from '../services/groupService'; // Import group service functions

// Helper function for generating initials
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

// Define a set of darker pastel colors for better text readability
const pastelColors = [
    "#c25151", // red
    "#bd7d3c", // orange
    "#5db54c", // green
    "#4ea4a6", // light blue
    "#555b9e", // blue
    "#7e599c", // purple
];

// Generate consistent color based on name from our predefined palette
const getConsistentColor = (name) => {
    if (!name) return pastelColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % pastelColors.length;
    return pastelColors[index];
};

// Function to truncate long names
const truncateName = (name, maxLength = 15) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
};

// Function to initialize group messages (keep as is if using localStorage for this)
function initializeGroupMessages() {
    const hasInitialized = localStorage.getItem('groupMessagesInitialized');
    if (hasInitialized) return;
    // ... (rest of the function if needed)
    console.log('Group messages initialization logic runs here (if applicable).');
}

// --- Friends Component ---
function Friends({ onSelectChat }) { // Removed allUsers prop as we fetch friends directly
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [friends, setFriends] = useState([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(true); // Loading state for friends
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    // Fetch friends using the service
    useEffect(() => {
        if (!currentUser) return; // Don't fetch if not logged in

        setIsLoadingFriends(true);
        const unsubscribe = getUserFriends(currentUser.uid, (fetchedFriends) => {
            setFriends(fetchedFriends);
            setIsLoadingFriends(false);
            console.log("Fetched friends:", fetchedFriends);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [currentUser]);


    const handleSendRequest = async (usernameToAdd) => {
        setError(null);
        if (!currentUser) {
            setError("You must be logged in to send friend requests.");
            throw new Error("User not logged in");
        }
        if (!usernameToAdd || usernameToAdd.trim() === '') {
            setError("Please enter a username.");
             throw new Error("Username required");
        }

        try {
            const targetUser = await findUserByUsername(usernameToAdd.trim());

            if (!targetUser) {
                throw new Error(`User "@${usernameToAdd.trim()}" not found.`);
            }
            if (targetUser.id === currentUser.uid) {
                throw new Error("You cannot add yourself as a friend.");
            }

            console.log(`Sending request from ${currentUser.uid} to ${targetUser.id}`);
            await sendFriendRequest(currentUser.uid, targetUser.id);
            console.log(`Friend request sent to: ${usernameToAdd}`);
            // Dialog will handle confirmation

        } catch (error) {
            console.error('Failed to send friend request:', error);
            setError(error.message || 'Failed to send friend request. Please try again.');
            throw error; // Re-throw to let the dialog know
        }
    };

    // Filter friends based on search and online status
    const filteredFriends = friends.filter((friend) => {
        const name = friend.displayName || friend.username || ''; // Handle potential missing names
        const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
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
                <button className={`filterOption ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
                <button className={`filterOption ${filter === "online" ? "active" : ""}`} onClick={() => setFilter("online")}>Online</button>
                <button className={`filterOption ${filter === "offline" ? "active" : ""}`} onClick={() => setFilter("offline")}>Offline</button>
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
                    onClick={() => { setIsAddFriendOpen(true); setError(null); }}
                    className="text-[18px] text-white flex items-center rounded-lg bg-green-700 p-3 w-full min-w-[230px] justify-center
                    transition duration-200 ease-in-out hover:bg-green-800">
                    Add Friend
                </button>

                <AddFriendDialog
                    isOpen={isAddFriendOpen}
                    onClose={() => setIsAddFriendOpen(false)}
                    onSendRequest={handleSendRequest}
                    initialError={error} // Pass error state to dialog
                />

                 {/* Display loading indicator or friends list */}
                 {isLoadingFriends ? (
                     <div className="loading-container p-5">
                         <div className="loading-spinner"></div>
                     </div>
                 ) : filteredFriends.length === 0 ? (
                     <p className="text-center text-[var(--text-secondary)] p-5">No friends found.</p>
                 ) : (
                    filteredFriends.map((friend) => (
                        <button
                            key={friend.id}
                            className="friend-button"
                            onClick={() => onSelectChat(friend)}> {/* friend already has chatType:'direct' from service */}
                            <div className="friend">
                                {friend.profilePicture ? (
                                    <img src={friend.profilePicture} alt={friend.displayName} className="friend-avatar" />
                                ) : (
                                    <div
                                        className="friend-avatar initials-avatar"
                                        style={{ backgroundColor: getConsistentColor(friend.displayName || friend.username) }}
                                    >
                                        {getInitials(friend.displayName || friend.username)}
                                    </div>
                                )}
                                {/* Ensure status indicator reflects actual data */}
                                <span className={`status-indicator ${friend.isOnline ? "online" : "offline"}`}></span>
                                <span className="friend-username">{truncateName(friend.displayName || friend.username)}</span>
                            </div>
                        </button>
                    ))
                 )}
            </div>
        </div>
    );
}

// --- Groups Component ---
function Groups({ onSelectChat }) { // Removed allUsers prop
    const [search, setSearch] = useState("");
    const [groups, setGroups] = useState([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
         if (!currentUser) return;

        setIsLoadingGroups(true);
        const unsubscribe = getUserGroups((fetchedGroups) => {
            setGroups(fetchedGroups.map(g => ({ ...g, chatType: 'group' }))); // Ensure chatType is set
            setIsLoadingGroups(false);
            console.log("Fetched groups:", fetchedGroups);
        });

        return () => unsubscribe();
    }, [currentUser]);


    const handleCreateGroup = (groupData) => {
        // Add logic to call createGroup service function from groupService.js
        console.log('Creating group:', groupData);
        // Example: createGroup(groupData).then(...).catch(...);
    };

     // Filter groups based on search
    const filteredGroups = groups.filter((group) => {
        const name = group.name || '';
        return name.toLowerCase().includes(search.toLowerCase());
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
            <div className="friends"> {/* Reusing 'friends' class for layout */}
                 {isLoadingGroups ? (
                     <div className="loading-container p-5">
                         <div className="loading-spinner"></div>
                     </div>
                 ) : filteredGroups.length === 0 ? (
                     <p className="text-center text-[var(--text-secondary)] p-5">No groups found.</p>
                 ) : (
                    filteredGroups.map((group) => (
                        <button
                            key={group.id}
                            className="friend-button" // Reusing class
                            onClick={() => onSelectChat(group)}>
                            <div className="friend"> {/* Reusing class */}
                                {group.groupImage ? ( // Assuming groupImage field
                                    <img src={group.groupImage} alt={group.name} className="friend-avatar" />
                                ) : (
                                    <div
                                        className="friend-avatar initials-avatar"
                                        style={{ backgroundColor: getConsistentColor(group.name) }}
                                    >
                                        {/* Use first letter of group name for initials */}
                                        {group.name ? group.name[0].toUpperCase() : 'G'}
                                    </div>
                                )}
                                <span className="friend-username">{truncateName(group.name)}</span>
                                <span className="member-count ml-auto text-xs text-[var(--text-secondary)]"> {/* Use ml-auto */}
                                    {group.members?.length || 0} members
                                </span>
                            </div>
                        </button>
                    ))
                 )}
                 {/* Create Group Button and Dialog */}
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-4 text-[18px] text-white flex gap-2 items-center rounded-lg bg-slate-500 p-3 w-full min-w-[230px] justify-center
                    transition duration-200 ease-in-out hover:bg-slate-600">
                    <FaPlus /> Create Group
                </button>
                <CreateGroupDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onCreateGroup={handleCreateGroup}
                />
            </div>
        </div>
    );
}

// --- Social Component (Main) ---
const Social = () => {
    const location = useLocation();
    const [activeChat, setActiveChat] = useState(null);
    const [activeTab, setActiveTab] = useState("Friends");
    const [allUsers, setAllUsers] = useState([]); // Keep for FriendsChatbox potentially

    // Initialize group messages (if needed)
    useEffect(() => {
        initializeGroupMessages();
    }, []);

    // Fetch all users (can be optimized later if only needed for chatbox)
    useEffect(() => {
        fetch("/users.json")
            .then(response => response.json())
            .then(data => {
                setAllUsers(data);
            });
    }, []);

    // Handle initial chat selection from navigation state or localStorage
    useEffect(() => {
        if (location.state?.user) {
            const userFromState = {
                ...location.state.user,
                 // Ensure chatType is 'direct' if coming from user link
                chatType: location.state.user.chatType || 'direct'
            };
            setActiveChat(userFromState);
            localStorage.setItem("lastActiveChat", JSON.stringify(userFromState));
        } else {
            const savedChat = localStorage.getItem("lastActiveChat");
            if (savedChat) {
                 try {
                    const parsedChat = JSON.parse(savedChat);
                     // Basic validation
                    if (parsedChat && parsedChat.id && parsedChat.chatType) {
                        setActiveChat(parsedChat);
                    } else {
                        localStorage.removeItem("lastActiveChat"); // Clear invalid data
                    }
                 } catch (e) {
                     console.error("Error parsing saved chat from localStorage", e);
                     localStorage.removeItem("lastActiveChat");
                 }
            }
        }
    }, [location.state]);

     // Handle selecting a chat (friend or group)
    const handleChatSelect = (chat) => {
        // Ensure chatType is present before saving
        if (chat && chat.id && chat.chatType) {
            setActiveChat(chat);
            localStorage.setItem("lastActiveChat", JSON.stringify(chat));
        } else {
            console.error("Attempted to select invalid chat object:", chat);
        }
    };


    // Set active tab based on navigation state
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
                {/* Conditionally render Friends or Groups */}
                {activeTab === "Friends" ?
                    <Friends onSelectChat={handleChatSelect} /> :
                    <Groups onSelectChat={handleChatSelect} />
                }
            </div>

            {/* Render chatbox if a chat is active */}
            {activeChat && <FriendsChatbox activeChat={activeChat} allUsers={allUsers} />}
        </div>
    );
};

export default Social;