import './friends.css';
import { FaUserCircle } from 'react-icons/fa';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const friends = [
    { id: "1", name: "user1", isOnline: true },
    { id: "2", name: "user2", isOnline: false },
    { id: "3", name: "user3", isOnline: true },
    { id: "4", name: "user4", isOnline: false },
    { id: "5", name: "user5", isOnline: true },
];

const Friends = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const filteredFriends = friends.filter((friend) => {
        const matchesSearch = friend.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filter === "all" ||
            (filter === "online" && friend.isOnline) ||
            (filter === "offline" && !friend.isOnline);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="container-friends">
            {/* Dashboard */}
            <div className="friends-menu">
                <div className="filter-container">
                    <h1>Friends</h1>
                </div>
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
        </div>
    )
}

export default Friends;