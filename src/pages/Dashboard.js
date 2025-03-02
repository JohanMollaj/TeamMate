
import './Dashboard.css';
import { FaUserCircle, FaUsers, FaBell } from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { AtSign, UserPlus } from 'lucide-react';
import { FaCog } from 'react-icons/fa';

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

function Dashboard() {
const navigate = useNavigate();
const [activeTab, setActiveTab] = useState('unread');
const containerRef = useRef(null);
const [friends, setFriends] = useState([]);
const [groups, setGroups] = useState([]);

useEffect(() => {
    fetch("/friends.json") // Adjust the path as needed
        .then(response => response.json())
        .then(data => setFriends(data));
}, []);    // Define a set of predefined pastel colors

// Add user state that would come from authentication/database
const [user, setUser] = useState({
    nickname: "Johan Mollaj",
    username: "m.jxhan",
    profileImage: null, // Set to image path when available
    bio: "Frontend developer passionate about UI/UX design",
    status: "online",
    joinDate: "January 2023"
});

// State to control profile dropdown visibility
const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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

// Helper function for generating initials (moved outside to be reused)
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
    "#bfb936", // yellow
    "#5db54c", // green
    "#4ea4a6", // light blue
    "#555b9e", // blue
    "#7e599c", // purple
];

// Generate consistent color based on name from our predefined palette
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

// Define NotificationTab component inside Dashboard to access state
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

// Close dropdown when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => {
        const profileElement = document.querySelector('.user-profile');
        if (profileElement && !profileElement.contains(event.target)) {
            setShowProfileDropdown(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
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
        {/* Full-width Dashboard Header */}
        <div className="dashboard-page-header">
            <h1>Dashboard</h1>
            <div className="user-controls">
                <button className="settings-button" onClick={() => navigate('/settings')}>
                    <FaCog size={24} />
                </button>
                <div 
                    className="user-profile"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                    <div className="user-info">
                        <span className="user-nickname">{user.nickname}</span>
                        <span className="user-username">@{user.username}</span>
                    </div>
                    {/* Profile picture with fallback to initials */}
                    {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="profile-avatar" />
                    ) : (
                        <div 
                            className="profile-avatar initials-avatar"
                            style={{ backgroundColor: getConsistentColor(user.nickname) }}
                        >
                            {getInitials(user.nickname)}
                        </div>
                    )}
                    
                    {/* Discord-style dropdown menu */}
                    {showProfileDropdown && (
                        <div className="profile-dropdown">
                            <div className="profile-dropdown-header">
                                <div className="profile-dropdown-avatar">
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt="Profile" />
                                    ) : (
                                        <div 
                                            className="dropdown-initials-avatar"
                                            style={{ backgroundColor: getConsistentColor(user.nickname) }}
                                        >
                                            {getInitials(user.nickname)}
                                        </div>
                                    )}
                                </div>
                                <div className="profile-dropdown-user-info">
                                    <span className="profile-dropdown-nickname">{user.nickname}</span>
                                    <span className="profile-dropdown-username">@{user.username}</span>
                                    <div className="profile-dropdown-status">
                                        <span className={`status-dot status-${user.status}`}></span>
                                        <span>{user.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-dropdown-section">
                                <h3>Bio</h3>
                                <p>{user.bio || "No bio set"}</p>
                            </div>
                            <div className="profile-dropdown-section">
                                <h3>Member Since</h3>
                                <p>{user.joinDate}</p>
                            </div>
                            <div className="profile-dropdown-footer">
                                <button className="profile-dropdown-button" onClick={() => navigate('/profile')}>
                                    Edit Profile
                                </button>
                                <button className="profile-dropdown-button profile-logout" onClick={() => console.log('Logging out...')}>
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="dashboard-content">
            <div className="dashboard"
            ref={containerRef}
            >
                <div className='sections'>
                    <div className="section">
                        <button onClick={() => navigate('/social')} className="dashboard-button">
                            <h2>Friends</h2>
                        </button>

                        <div className="dashboard-friends">
                            {friends.filter(friend => friend.isOnline).map(friend => (
                                <button key={friend.id} className="dashboard-friend" onClick={() => handleChatRedirect(friend)}>
                                    {friend.profileImage ? (
                                        <img src={friend.profileImage} alt={friend.name} className="friend-icon" />
                                    ) : (
                                        <div 
                                            className="friend-icon initials-avatar"
                                            style={{ backgroundColor: getConsistentColor(friend.name) }}
                                        >
                                            {getInitials(friend.name)}
                                        </div>
                                    )}
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
                                    {group.groupImage ? (
                                        <img src={group.groupImage} alt={group.name} className="group-icon" />
                                    ) : (
                                        <div 
                                            className="group-icon initials-avatar"
                                            style={{ backgroundColor: getConsistentColor(group.name) }}
                                        >
                                            {getInitials(group.name)}
                                        </div>
                                    )}
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
    </div>
);
}

export default Dashboard;