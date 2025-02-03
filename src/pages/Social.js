import './social.css';
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { FaUserGroup } from "react-icons/fa6";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

function Friends() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [friends, setFriends] = useState([]);

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
        <div>
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
                        {filteredFriends.map((friend) => (
                            <div
                                key={friend.id}
                                className="flex items-center gap-3 rounded-lg bg-zinc-700 p-3">
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
                            </div>
                        ))}
                    </div>
                </div>
        </div>
    );
}

function Groups() {
    const [search, setSearch] = useState("");
    const [groups, setGroups] = useState([]);

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
        <div>
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
                            <div
                                key={group.id}
                                className="flex items-center gap-3 rounded-lg bg-zinc-700 p-3">
                                <div className="friend flex items-center gap-2">
                                    <FaUserGroup className='icon' />
                                    <span className="friend-username">{group.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
        </div>
    );
}
const Social = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const [activeTab, setActiveTab] = useState("Friends");
    const toggleTab = () => {
        setActiveTab((prevTab) => (prevTab === "Friends" ? "Groups" : "Friends"));
      };

    return (
        <div className="container-friends">
            {/* Dashboard */}

            <div className="friends-menu">
                <div className="filter-container">
                    <button className='switchOption'
                            onClick={toggleTab}>
                            <FaArrowRightArrowLeft /></button>
                    <h1>{activeTab}</h1>
                </div>
                {activeTab === "Friends" ? <Friends /> : <Groups />}
            </div>
        </div>
    )
}

export default Social;