import './social.css';
import FriendsChatbox from '../components/FriendsChatbox';

import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { FaUserGroup } from "react-icons/fa6";
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

<<<<<<< Updated upstream
function Friends({ onSelectChat }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [friends, setFriends] = useState([]);
=======
// Helper function for generating initials (same as dashboard)
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

// Generate consistent color based on name from our predefined palette (same as dashboard)
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

// Define a set of darker pastel colors for better text readability (same as dashboard)
const pastelColors = [
    "#c25151", // red
    "#bd7d3c", // orange
    "#5db54c", // green
    "#4ea4a6", // light blue
    "#555b9e", // blue
    "#7e599c", // purple
];

// Function to truncate long names
const truncateName = (name, maxLength = 15) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
};

function Friends({ onSelectChat, allUsers }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [friends, setFriends] = useState([]);
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

    const handleSendRequest = async (username) => {
        try {
            // Find the user ID by username (this would be a backend lookup in production)
            // For now we'll just log it
            console.log(`Friend request sent to: ${username}`, {
                timestamp: new Date().toISOString(),
                action: 'friend_request_sent',
                target_user: username,
                status: 'success'
            });
            
            // In a real implementation, we would call the API:
            // const response = await fetch('/api/users/1/friend-requests', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ toUserId: '2' }) // Replace with actual user ID
            // });
        } catch (error) {
            console.error("Error sending friend request:", error);
            throw error;
        }
    };
>>>>>>> Stashed changes

    const filteredFriends = friends.filter((friend) => {
        const matchesSearch = friend.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filter === "all" ||
            (filter === "online" && friend.isOnline) ||
            (filter === "offline" && !friend.isOnline);
        return matchesSearch && matchesFilter;
    });

<<<<<<< Updated upstream
        useEffect(() => {
            fetch("/friends.json") // Adjust the path as needed
                .then(response => response.json())
                .then(data => setFriends(data));
        }, []);
=======
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                // Try to fetch from the API
                const response = await fetch("/api/users");
                
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Add chatType to distinguish direct messages
                const friendsWithChatType = data.map(friend => ({
                    ...friend,
                    id: friend._id,
                    chatType: 'direct',
                    name: friend.name || friend.username
                }));
                
                setFriends(friendsWithChatType);
            } catch (error) {
                console.error("Error fetching friends from API:", error);
                
                // Fallback to JSON file if API fails
                console.warn("Falling back to friends.json");
                fetch("/friends.json")
                    .then(response => response.json())
                    .then(data => {
                        // Add chatType to distinguish direct messages
                        const friendsWithChatType = data.map(friend => ({
                            ...friend,
                            chatType: 'direct'
                        }));
                        setFriends(friendsWithChatType);
                    })
                    .catch(fallbackError => {
                        console.error("Error with fallback:", fallbackError);
                        setFriends([]);
                    });
            }
        };
        
        fetchFriends();
    }, []);
>>>>>>> Stashed changes

    return (
        <div className='w-[220px]'>
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

                <div className='section'>
                    <div className="friends">
                        <button className="text-[18px] flex items-center rounded-lg bg-green-700 p-3 w-full min-w-[230px] items-center justify-center
                        transition duration-200 ease-in-out hover:bg-green-800">
                            Add Friend
                        </button>

                        {filteredFriends.map((friend) => (
                            <button
                                key={friend.id}
                                className="flex items-center gap-3 rounded-lg bg-zinc-700 p-3 w-full min-w-[230px]"
                                onClick={() => onSelectChat(friend)}>
                                <div className="friend flex items-center gap-2">
                                    <User className="friend-icon" />
                                    <span className="friend-username">{friend.name}</span>
                                    <div className="online-indicator">
                                        {friend.isOnline ? (
                                            <span className="friend-status online">Online</span>
                                        ) : (
                                            <span className="friend-status offline">Offline</span> 
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
        </div>
    );
}

function Groups() {
    const [search, setSearch] = useState("");
    const [groups, setGroups] = useState([]);
<<<<<<< Updated upstream

    useEffect(() => {
        fetch("/groups.json") // Adjust the path as needed
            .then(response => response.json())
            .then(data => setGroups(data));
=======
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCreateGroup = async (groupData) => {
        try {
            // Send to API
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: groupData.name,
                    description: groupData.description,
                    createdBy: "1", // Current user
                    members: groupData.members || ["1"] // Include current user by default
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create group');
            }

            const newGroup = await response.json();
            
            // Add to local state with needed properties for UI
            const groupWithChatType = {
                ...newGroup,
                id: newGroup._id,
                chatType: 'group'
            };
            
            setGroups(prevGroups => [...prevGroups, groupWithChatType]);
        } catch (error) {
            console.error("Error creating group:", error);
            
            // Fallback to localStorage if API isn't working yet
            console.warn("Falling back to localStorage for group creation");
            
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
            
            // Save to localStorage
            const savedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
            localStorage.setItem('groups', JSON.stringify([...savedGroups, newGroup]));
        }
    };

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                // Try to fetch from the API
                const response = await fetch("/api/groups");
                
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Format for UI
                const groupsWithChatType = data.map(group => ({
                    ...group,
                    id: group._id,
                    chatType: 'group'
                }));
                
                setGroups(groupsWithChatType);
            } catch (error) {
                console.error("Error fetching groups from API:", error);
                
                // First try to get from localStorage
                const savedGroups = localStorage.getItem('groups');
                if (savedGroups) {
                    try {
                        setGroups(JSON.parse(savedGroups));
                    } catch (parseError) {
                        console.error("Error parsing localStorage groups:", parseError);
                        fallbackToJSON();
                    }
                } else {
                    // Otherwise fetch from JSON file
                    fallbackToJSON();
                }
            }
        };
        
        // Fallback to JSON file
        const fallbackToJSON = () => {
            console.warn("Falling back to groups.json");
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
                .catch(fallbackError => {
                    console.error("Error with fallback:", fallbackError);
                    setGroups([]);
                });
        };
        
        fetchGroups();
>>>>>>> Stashed changes
    }, []);

    const filteredGroups = groups.filter((group) => {
        const matchesSearch = group.name.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });
    
    return (
        <div className='w-[230px]'>
            <div className='search-box'>
                    <input
                        placeholder="Search groups..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="textarea"
                    />
            </div>
            <div className='section'>
                    <div className="friends">
                        {filteredGroups.map((group) => (
                            <button
                                key={group.id}
                                className="flex items-center gap-3 rounded-lg bg-zinc-700 p-3 w-full w-min-[230px]">
                                <div className="friend flex items-center gap-2">
                                    <FaUserGroup className='icon' />
                                    <span className="friend-username">{group.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
        </div>
    );
}
const Social = () => {
    const location = useLocation();
    const [activeChat, setActiveChat] = useState(null);
    const [activeTab, setActiveTab] = useState("Friends");
    
<<<<<<< Updated upstream
=======
    useEffect(() => {
        // Load all users for reference (needed for displaying sender names in group chats)
        const fetchAllUsers = async () => {
            try {
                const response = await fetch("/api/users");
                
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }
                
                const data = await response.json();
                setAllUsers(data);
            } catch (error) {
                console.error("Error fetching all users:", error);
                
                // Fallback to JSON file if API fails
                fetch("/friends.json")
                    .then(response => response.json())
                    .then(data => {
                        setAllUsers(data);
                    })
                    .catch(fallbackError => {
                        console.error("Error with fallback:", fallbackError);
                        setAllUsers([]);
                    });
            }
        };
        
        fetchAllUsers();
    }, []);

>>>>>>> Stashed changes
    useEffect(() => {
        // Handle user passed from dashboard
        if (location.state?.user) {
            setActiveChat(location.state.user);
            localStorage.setItem("lastActiveChat", JSON.stringify(location.state.user));
        } else {
            // If no user passed, check localStorage
            const savedChat = localStorage.getItem("lastActiveChat");
            if (savedChat) {
                setActiveChat(JSON.parse(savedChat));
            }
        }
    }, [location.state]);

    const handleChatSelect = (user) => {
        setActiveChat(user);
        localStorage.setItem("lastActiveChat", JSON.stringify(user)); // Save the chat
    };

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const toggleTab = () => {
        setActiveTab((prevTab) => (prevTab === "Friends" ? "Groups" : "Friends"));
      };

    return (
        <div className="container-friends">
            {/* Dashboard */}

            <div className="friends-menu w-[220px]">
                <div className="filter-container">
                    <button className='switchOption'
                            onClick={toggleTab}>
                            <FaArrowRightArrowLeft /></button>
                    <h1>{activeTab}</h1>
                </div>
                {activeTab === "Friends" ? <Friends onSelectChat={handleChatSelect} /> : <Groups />}
            </div>

            {activeChat && <FriendsChatbox activeChat={activeChat} />}
        </div>
    )
}

export default Social;