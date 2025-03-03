import './social.css';
import FriendsChatbox from '../components/FriendsChatbox';
import CreateGroupDialog from '../components/createGroupDialog';
import AddFriendDialog from '../components/addFriendDialog';

import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { FaUserGroup, FaPlus } from "react-icons/fa6";
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
const truncateName = (name, maxLength = 20) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
};

function Friends({ onSelectChat }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [friends, setFriends] = useState([]);
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

    const handleSendRequest = async (username) => {
        console.log(`Friend request sent to: ${username}`, {
          timestamp: new Date().toISOString(),
          action: 'friend_request_sent',
          target_user: username,
          status: 'success'
        });
    };

    const filteredFriends = friends.filter((friend) => {
        const matchesSearch = friend.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filter === "all" ||
            (filter === "online" && friend.isOnline) ||
            (filter === "offline" && !friend.isOnline);
        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        fetch("/friends.json") // Adjust the path as needed
            .then(response => response.json())
            .then(data => setFriends(data));
    }, []);

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

            <div className='section'>
                <div className="friends">
                    <button 
                    onClick={() => setIsAddFriendOpen(true)}
                    className="text-[18px] flex items-center rounded-lg bg-green-700 p-3 w-full min-w-[230px] items-center justify-center
                    transition duration-200 ease-in-out hover:bg-green-800">
                        Add Friend
                    </button>

                    <AddFriendDialog
                        isOpen={isAddFriendOpen}
                        onClose={() => setIsAddFriendOpen(false)}
                        onSendRequest={handleSendRequest}
                    />

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
        </div>
    );
}

function Groups() {
    const [search, setSearch] = useState("");
    const [groups, setGroups] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCreateGroup = (groupData) => {
        console.log('Creating group:', groupData);
        // Add your group creation logic here
    };

    useEffect(() => {
        fetch("/groups.json") // Adjust the path as needed
            .then(response => response.json())
            .then(data => setGroups(data));
    }, []);

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
            <div className='section'>
                <div className="friends">
                    {filteredGroups.map((group) => (
                        <button
                            key={group.id}
                            className="friend-button">
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
                            </div>
                        </button>
                    ))}
                    <button 
                    onClick={() => setIsDialogOpen(true)}
                    className="text-[18px] flex gap-2 items-center rounded-lg bg-slate-500 p-3 w-full min-w-[230px] items-center justify-center
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
        </div>
    );
}

const Social = () => {
    const location = useLocation();
    const [activeChat, setActiveChat] = useState(null);
    const [activeTab, setActiveTab] = useState("Friends");
    
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
            <div className="friends-menu">
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