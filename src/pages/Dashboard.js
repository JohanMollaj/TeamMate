import './Dashboard.css';
import { FaUserCircle, FaUsers } from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Dashboard(){
    const navigate  = useNavigate();

    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        fetch("/friends.json") // Adjust the path as needed
            .then(response => response.json())
            .then(data => setFriends(data));
    }, []);
    useEffect(() => {
        fetch("/groups.json") // Adjust the path as needed
            .then(response => response.json())
            .then(data => setGroups(data));
    }, []);

    return(
            <div className="container-dashboard">
                {/* Dashboard */}
                <div className="dashboard">
                    <h1>Dashboard</h1>
                    
                    <div className="section">
                        <button onClick={() => navigate('/social')} className="dashboard-button">
                            <h2>Friends &gt;</h2>
                        </button>

                        <div className="dashboard-friends">
                            {friends.filter(friend => friend.isOnline).map(friend => (
                                <button key={friend.id} className="dashboard-friend">
                                    <FaUserCircle className="friend-icon" />
                                    <span>{friend.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="section">
                    <button onClick={() => navigate("/social", { state: { tab: "Groups" } })} className="dashboard-button">
                        <h2>Groups &gt;</h2>
                    </button>
                        <div className="groups">
                        {groups.map(group => (
                            <button key={group.id} className="group">
                                <FaUsers className="group-icon" />
                                <span>{group.name}</span>
                            </button>
                        ))}
                        </div>
                    </div>

                    <div className="section">
                    <button onClick={() => navigate('/tasks')} className="dashboard-button">
                        <h2>Tasks &gt;</h2>
                    </button>
                    <p>You have finished all your tasks!</p>
                    </div>
                </div>
            </div>
    )
}

export default Dashboard;