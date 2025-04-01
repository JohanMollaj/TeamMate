// Updated Dashboard.js to handle dynamic user data
import './Dashboard.css';
import { FaUserCircle, FaUsers, FaBell, FaSignOutAlt } from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { AtSign, UserPlus } from 'lucide-react';
import { FaCog } from 'react-icons/fa';

const DashboardTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'
    const [currentUser, setCurrentUser] = useState(null);

    // Helper function for truncating long names
    const truncateName = (name, maxLength = 50) => {
        if (!name) return '';
        if (name.length <= maxLength) return name;
        return name.slice(0, maxLength) + '...';
    };    

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
      const user = JSON.parse(localStorage.getItem('currentUser'));
      setCurrentUser(user);
      
      const fetchTasks = () => {
        try {
          // Get tasks from localStorage
          const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
          const userTasks = allTasks[user.id] || [];
          setTasks(userTasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
          setTasks([]);
        }
      };
      
      if (user) {
        fetchTasks();
      }
    }, []);
  
    // Filter tasks based on due date
    const getFilteredTasks = () => {
      const pendingTasks = tasks.filter(task => !task.completed);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      switch(filter) {
        case 'today':
          return pendingTasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
          });
        case 'week':
          return pendingTasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate < nextWeek;
          });
        case 'month':
          return pendingTasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate < nextMonth;
          });
        case 'overdue':
          return pendingTasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
          });
        default:
          return pendingTasks;
      }
    };
  
    // Sort tasks by due date (closest first)
    const sortedTasks = getFilteredTasks().sort((a, b) => {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  
    // Get task status for styling
    const getTaskStatus = (dueDate) => {
      const taskDate = new Date(dueDate);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      
      // Reset time parts for accurate date comparison
      taskDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);
      
      if (taskDate < today) return "Overdue";
      if (taskDate.getTime() === today.getTime()) return "Today";
      if (taskDate.getTime() === tomorrow.getTime()) return "Tomorrow";
      return "Upcoming";
    };
  
    return (
      <div>
        <div className="task-filter-controls">
          <button 
            className={`task-filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`task-filter-button ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            Today
          </button>
          <button 
            className={`task-filter-button ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >
            This Week
          </button>
          <button 
            className={`task-filter-button ${filter === 'month' ? 'active' : ''}`}
            onClick={() => setFilter('month')}
          >
            This Month
          </button>
          <button 
            className={`task-filter-button ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            Overdue
          </button>
        </div>
        
        {sortedTasks.length === 0 ? (
          <p className="no-tasks-message">
            {filter === 'all' 
              ? "You have finished all your tasks!" 
              : `No tasks ${filter === 'overdue' ? 'overdue' : `due ${filter}`}.`}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {sortedTasks.map(task => {
              const status = getTaskStatus(task.dueDate);
              const statusClass = `status-${status.toLowerCase()}`;
              
              return (
                <button 
                  key={task.id} 
                  className={`dashboard-task-container ${statusClass}`}
                >
                  <div className='dashboard-task-title' data-status={status}>{truncateName(task.title)}</div>
                  <div className='dashboard-task-duedate'>{formatDate(task.dueDate)}</div>
                </button>
              );
            })}
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
const [notifications, setNotifications] = useState({
    unread: [],
    mentions: [],
    friendRequests: []
});

// Add user state that would come from authentication/database
const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        setCurrentUser(user);
    }
    
    // Fetch friends
    const fetchFriends = () => {
        try {
            const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
            
            if (user && user.id) {
                // Find the full user object to get friends list
                const fullUserData = allUsers.find(u => u.id === user.id);
                
                if (fullUserData && fullUserData.friends) {
                    // Filter and map users who are in the friends list
                    const userFriends = allUsers
                        .filter(u => fullUserData.friends.includes(u.id))
                        .map(friend => ({
                            id: friend.id,
                            name: friend.name,
                            username: friend.username,
                            profileImage: friend.profilePicture,
                            isOnline: friend.isOnline,
                            bio: friend.bio,
                            chatType: 'direct'
                        }));
                    
                    setFriends(userFriends);
                }
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
            setFriends([]);
        }
    };
    
    // Fetch groups
    const fetchGroups = () => {
        try {
            const savedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
            setGroups(savedGroups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setGroups([]);
        }
    };
    
    // Fetch notifications
    const fetchNotifications = () => {
        try {
            const allNotifications = JSON.parse(localStorage.getItem('notifications') || '{}');
            const userNotifications = allNotifications[user.id] || [];
            
            // Categorize notifications
            const categorized = {
                unread: userNotifications.filter(n => !n.read),
                mentions: userNotifications.filter(n => n.type === 'mention'),
                friendRequests: userNotifications.filter(n => n.type === 'friend_request')
            };
            
            setNotifications(categorized);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };
    
    if (user) {
        fetchFriends();
        fetchGroups();
        fetchNotifications();
    }
}, []);

// Helper function for truncating long names
const truncateName = (name, maxLength = 10) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
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
                ? 'bg-[var(--notification-active)] text-[var(--text-primary)]' 
                : 'bg-[var(--notifcation-button)] hover:bg-[var(--notification-hover)]'
        }`}
        onClick={() => setActiveTab(type)}
    >
        <Icon size={18} />
        <span>{label}</span>
        <span className="ml-2 bg-[var(--notification-circle)] px-2 py-1 rounded-full text-xs">
            {notifications[type]?.length || 0}
        </span>
    </button>
);

// Close dropdown when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => {
        const profileElement = document.querySelector('.user-profile');
        const dropdownElement = document.querySelector('.profile-dropdown');
        
        // Only close if click is outside both profile and dropdown
        if (
            profileElement && 
            !profileElement.contains(event.target) && 
            (!dropdownElement || !dropdownElement.contains(event.target))
        ) {
            setShowProfileDropdown(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, []);

const handleChatRedirect = (user) => {
    localStorage.setItem("activeChat", JSON.stringify(user)); // Save the selected user
    navigate("/social", { state: { user } }); // Redirect to the Friends page
};

// State to control profile dropdown visibility
const [showProfileDropdown, setShowProfileDropdown] = useState(false);

// Handle logout
const handleLogout = () => {
    // Update user's online status in the users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
            return { ...u, isOnline: false };
        }
        return u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Redirect to login page
    navigate('/login');
};

if (!currentUser) {
    // Could add a loading state here
    return <div>Loading...</div>;
}

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
                        <span className="user-nickname">{currentUser.name}</span>
                        <span className="user-username">@{currentUser.username}</span>
                    </div>
                    {/* Profile picture with fallback to initials */}
                    {currentUser.profilePicture ? (
                        <img src={currentUser.profilePicture} alt="Profile" className="profile-avatar" />
                    ) : (
                        <div 
                            className="profile-avatar initials-avatar"
                            style={{ backgroundColor: getConsistentColor(currentUser.name) }}
                        >
                            {getInitials(currentUser.name)}
                        </div>
                    )}
                    
                    {/* Discord-style dropdown menu */}
                    {showProfileDropdown && (
                        <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                            <div className="profile-dropdown-header">
                                <div className="profile-dropdown-avatar">
                                    {currentUser.profilePicture ? (
                                        <img src={currentUser.profilePicture} alt="Profile" />
                                    ) : (
                                        <div 
                                            className="dropdown-initials-avatar"
                                            style={{ backgroundColor: getConsistentColor(currentUser.name) }}
                                        >
                                            {getInitials(currentUser.name)}
                                        </div>
                                    )}
                                </div>
                                <div className="profile-dropdown-user-info">
                                    <span className="profile-dropdown-nickname">{currentUser.name}</span>
                                    <span className="profile-dropdown-username">@{currentUser.username}</span>
                                    <div className="profile-dropdown-status">
                                        <span className="status-dot status-online"></span>
                                        <span>online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-dropdown-section">
                                <h3>Bio</h3>
                                <p>{currentUser.bio || "No bio set"}</p>
                            </div>
                            <div className="profile-dropdown-section">
                                <h3>Member Since</h3>
                                <p>{currentUser.joinDate}</p>
                            </div>
                            <div className="profile-dropdown-footer">
                                <button className="profile-dropdown-button" onClick={() => navigate('/profile')}>
                                    Edit Profile
                                </button>
                                <button className="profile-dropdown-button profile-logout" onClick={handleLogout}>
                                    <FaSignOutAlt size={14} className="mr-2" /> Log Out
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
                            {friends.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">👋</div>
                                    <p>You don't have any friends added yet</p>
                                    <button
                                        onClick={() => navigate('/social')}
                                        className="empty-state-action"
                                    >
                                        Add Friends
                                    </button>
                                </div>
                            ) : friends.filter(friend => friend.isOnline).length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">💤</div>
                                    <p>None of your friends are online right now</p>
                                </div>
                            ) : (
                                friends.filter(friend => friend.isOnline).map(friend => (
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
                                        <span>{truncateName(friend.name)}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="section">
                        <button onClick={() => navigate("/social", { state: { tab: "Groups" } })} className="dashboard-button">
                            <h2>Groups</h2>
                        </button>
                        <div className="groups">
                            {groups.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">👥</div>
                                    <p>You don't have any groups yet</p>
                                    <button
                                        onClick={() => navigate("/social", { state: { tab: "Groups" } })}
                                        className="empty-state-action"
                                    >
                                        Create a Group
                                    </button>
                                </div>
                            ) : (
                                groups.map(group => (
                                    <button key={group.id} className="group" onClick={() => handleChatRedirect(group)}>
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
                                        <span>{truncateName(group.name)}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="section task-section">
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
                        {notifications[activeTab]?.length > 0 ? (
                            notifications[activeTab].map(notification => (
                                <div key={notification.id} className="notification-item">
                                    <p className="notification-text">{notification.title}</p>
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">
                                        {new Date(notification.time).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="no-notifications">
                                <p>No {activeTab} notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

export default Dashboard;