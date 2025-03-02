import './social.css';
import FriendsChatbox from '../components/FriendsChatbox';
import CreateGroupDialog from '../components/createGroupDialog';
import AddFriendDialog from '../components/addFriendDialog';

import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { FaUserGroup, FaPlus } from "react-icons/fa6";
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

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
                                className="flex items-center gap-3 rounded-lg bg-zinc-700 p-3 w-full min-w-[230px]"
                                onClick={() => onSelectChat(friend)}>
                                <div className="friend flex items-center gap-2">
                                    <User className="user-icon" />
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