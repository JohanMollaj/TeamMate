import './Dashboard.css';
import { FaUserCircle, FaUsers, FaBell } from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { AtSign, UserPlus } from 'lucide-react';
import { FaRegPenToSquare } from "react-icons/fa6";

const DashboardTasks = () => {
    const [tasks, setTasks] = useState([]);
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }) + ' at ' + date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      };

    useEffect(() => {
      const fetchTasks = async () => {
        try {
          const response = await fetch('/tasks.json');
          const data = await response.json();
          setTasks(data.tasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };
      
      fetchTasks();
    }, []);
  
    const pendingTasks = tasks.filter(task => !task.completed);
  
    return (
      <div>
        {pendingTasks.length === 0 ? (
          <p style={{ color: '#e5e7eb' }}>You have finished all your tasks!</p>
        ) : (
          <div className="flex flex-row gap-6">
            {pendingTasks.map(task => (
                <button key={task.id} className="dashboard-task-container">
                    <div className='dashboard-task-title'>{task.title}</div>
                    <div className='dashboard-task-duedate'>{formatDate(task.dueDate)}</div>
                </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  

function Dashboard(){
    const navigate  = useNavigate();
    const [activeTab, setActiveTab] = useState('unread');

    const containerRef = useRef(null);

    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const notifications = {
        unread: [
            { id: 1, text: "New message in 'Project Team'", time: "30 minutes ago" },
            { id: 2, text: "Task deadline approaching: Project Report", time: "1 hour ago" }
        ],
        mentions: [
            { id: 1, text: "@you was mentioned in Group1", time: "2 hours ago" },
            { id: 2, text: "@you was tagged in Group1", time: "5 hours ago" }
        ],
        friendRequests: [
            { id: 1, text: "John sent you a friend request", time: "10 minutes ago" },
            { id: 2, text: "Sarah accepted your friend request", time: "1 day ago" }
        ]
    };
    const NotificationTab = ({ label, icon: Icon, type }) => (
        <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === type 
                    ? 'bg-gray-500 text-white' 
                    : 'bg-gray-700/10 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab(type)}
        >
            <Icon size={18} />
            <span>{label}</span>
            <span className="ml-2 bg-gray-700 px-2 py-1 rounded-full text-xs">
                {notifications[type].length}
            </span>
        </button>
    );

    

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

    const handleChatRedirect = (user) => {
        console.log(user);
        localStorage.setItem("activeChat", JSON.stringify(user)); // Save the selected user
        navigate("/social", { state: { user } }); // Redirect to the Friends page (change this if your route is different)
    };
    return(
            <div className="container-dashboard">
                {/* Dashboard */}
                <div className="dashboard"
                ref={containerRef}
                >
                    <div className='sections'>
                        <div  className='dashboardHeader'>
                            <h1>Dashboard</h1>
                        </div>
                        <div className="section">
                            <button onClick={() => navigate('/social')} className="dashboard-button">
                                <h2>Friends</h2>
                            </button>

                            <div className="dashboard-friends">
                                {friends.filter(friend => friend.isOnline).map(friend => (
                                    <button key={friend.id} className="dashboard-friend" onClick={() => handleChatRedirect(friend)}>
                                        <FaUserCircle className="friend-icon" />
                                        <span>{friend.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="section">
                        <button onClick={() => navigate("/social", { state: { tab: "Groups" } })} className="dashboard-button">
                            <h2>Groups</h2>
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
                                <h2>Tasks</h2>
                            </button>
                            <DashboardTasks />
                        </div>
                    </div>

                    <div className="notifications-panel">
                        <div className="notifications-header">
                        <h2><FaBell /> Notifications</h2>
                        </div>
                        
                        <div className="notification-tabs">
                            <NotificationTab 
                                label="Unread" 
                                icon={FaBell} 
                                type="unread" 
                            />  
                            <NotificationTab 
                                label="Mentions" 
                                icon={AtSign} 
                                type="mentions" 
                            />
                            <NotificationTab 
                                label="Friends" 
                                icon={UserPlus} 
                                type="friendRequests" 
                            />
                        </div>

                        <div className="notifications-list">
                            {notifications[activeTab].map(notification => (
                                <div key={notification.id} className="notification-item">
                                    <p className="notification-text">{notification.text}</p>
                                    <span className="notification-time">{notification.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default Dashboard;