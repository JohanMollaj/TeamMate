import './Dashboard.css';
import { FaUserCircle, FaUsers } from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard(){
    const navigate  = useNavigate();

    return(
            <div className="container-dashboard">
                {/* Dashboard */}
                <div className="dashboard">
                    <h1>Dashboard</h1>
                    
                    <div className="section">
                        <button onClick={() => navigate('/friends')} className="dashboard-button">
                            <h2>Friends &gt;</h2>
                        </button>

                        <div className="dashboard-friends">
                            <div className="dashboard-friend">
                                <FaUserCircle className="friend-icon" />
                                <span>user1</span>
                            </div>
                            <div className="dashboard-friend">
                                <FaUserCircle className="friend-icon" />
                                <span>user2</span>
                            </div>
                            <div className="dashboard-friend">
                                <FaUserCircle className="friend-icon" />
                                <span>user3</span>
                            </div>
                        </div>
                    </div>

                    <div className="section">
                    <button onClick={() => navigate('/groups')} className="dashboard-button">
                            <h2>Groups &gt;</h2>
                        </button>
                        <div className="groups">
                            <div className="group">
                                <FaUsers className="group-icon" />
                                <span>group1</span>
                            </div>
                            <div className="group">
                                <FaUsers className="group-icon" />
                                <span>group2</span>
                            </div>
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