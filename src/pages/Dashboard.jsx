import './Dashboard.css';
import Profile from './Profile';

import { FaUserCircle, FaUsers, FaBell } from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { AtSign, UserPlus } from 'lucide-react';
import { FaCog } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  orderBy, 
  onSnapshot,
  Timestamp,
  limit,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const DashboardTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [loading, setLoading] = useState(true);

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
    // Don't fetch if not authenticated
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Create a query against the tasks collection
    const tasksQuery = query(
      collection(db, "tasks"),
      where("assignedTo", "==", auth.currentUser.uid),
      orderBy("dueDate", "asc")
    );
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
      const tasksList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to Date string
          dueDate: data.dueDate instanceof Timestamp ? 
            data.dueDate.toDate().toISOString() : 
            data.dueDate
        };
      });
      
      setTasks(tasksList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      // Fallback to fetching from local JSON if Firebase fails
      fetchLocalTasks();
    });
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  // Fallback function to fetch from local JSON
  const fetchLocalTasks = async () => {
    try {
      const response = await fetch('/tasks.json');
      const data = await response.json();
      setTasks(data.tasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching local tasks:', error);
      setLoading(false);
    }
  };

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
      
      {loading ? (
        <div className="loading-container p-5">
          <div className="loading-spinner"></div>
        </div>
      ) : sortedTasks.length === 0 ? (
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
                onClick={() => navigate(`/tasks?taskId=${task.id}`)}
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
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    unread: [],
    mentions: [],
    friendRequests: []
  });

  // Add user state that would come from authentication/database
  const [user, setUser] = useState({
    nickname: "User",
    username: "user",
    profileImage: null,
    bio: "",
    status: "offline",
    joinDate: "2025"
  });

  // Effect to load user profile from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            nickname: userData.displayName || auth.currentUser.displayName || "User",
            username: userData.username || auth.currentUser.email?.split('@')[0] || "user",
            profileImage: userData.profilePicture || auth.currentUser.photoURL,
            bio: userData.bio || "",
            status: userData.isOnline ? "online" : "offline",
            joinDate: userData.createdAt instanceof Timestamp ? 
              new Date(userData.createdAt.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 
              "2025"
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Fetch friends from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    
    // Get friends that are online
    const fetchFriends = async () => {
      try {
        // Get friends list from the user's subcollection
        const friendsRef = collection(db, "users", auth.currentUser.uid, "friends");
        const friendsQuery = query(friendsRef, where("status", "==", "accepted"), limit(5));
        
        // Set up real-time listener for friends
        const unsubscribe = onSnapshot(friendsQuery, async (querySnapshot) => {
          const friendsPromises = querySnapshot.docs.map(async (doc) => {
            const friendData = doc.data();
            // Get full friend profile
            const friendDocRef = doc(db, "users", friendData.userId);
            const friendDocSnap = await getDoc(friendDocRef);
            
            if (friendDocSnap.exists()) {
              const friendProfile = friendDocSnap.data();
              return {
                id: friendData.userId,
                name: friendProfile.displayName || friendProfile.username || "User",
                isOnline: friendProfile.isOnline || false,
                profileImage: friendProfile.profilePicture,
                chatType: 'direct'
              };
            }
            return null;
          });
          
          const resolvedFriends = (await Promise.all(friendsPromises)).filter(Boolean);
          setFriends(resolvedFriends);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching friends:", error);
          // Fallback to local data
          fetchLocalFriends();
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up friends listener:", error);
        fetchLocalFriends();
        return () => {};
      }
    };
    
    // Fallback to fetch from local JSON if Firebase fails
    const fetchLocalFriends = async () => {
      try {
        const response = await fetch("/users.json");
        const data = await response.json();
        // Take first few as "friends" and add chatType
        setFriends(data.slice(0, 5).map(user => ({
          ...user,
          chatType: 'direct'
        })));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching local friends data:", error);
        setLoading(false);
      }
    };
    
    const unsubscribeFriends = fetchFriends();
    
    return () => {
      if (typeof unsubscribeFriends === 'function') {
        unsubscribeFriends();
      }
    };
  }, []);

  // Fetch groups from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const fetchGroups = async () => {
      try {
        // Query groups where current user is a member
        const groupsQuery = query(
          collection(db, "groups"),
          where("members", "array-contains", auth.currentUser.uid),
          limit(5)
        );
        
        // Set up real-time listener for groups
        const unsubscribe = onSnapshot(groupsQuery, (querySnapshot) => {
          const groupsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || `Group ${doc.id}`,
            groupImage: doc.data().groupImage,
            members: doc.data().members || [],
            chatType: 'group'
          }));
          
          setGroups(groupsList);
        }, (error) => {
          console.error("Error fetching groups:", error);
          // Fallback to local JSON
          fetchLocalGroups();
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up groups listener:", error);
        fetchLocalGroups();
        return () => {};
      }
    };
    
    // Fallback to fetch from local JSON if Firebase fails
    const fetchLocalGroups = async () => {
      try {
        const response = await fetch("/groups.json");
        const data = await response.json();
        
        // Add chatType property to each group
        const enhancedGroups = data.map(group => ({
          ...group,
          chatType: 'group',
          members: [auth.currentUser?.uid || '1', '2', '3'] // Mock member IDs
        }));
        
        setGroups(enhancedGroups);
      } catch (error) {
        console.error("Error fetching local groups data:", error);
      }
    };
    
    const unsubscribeGroups = fetchGroups();
    
    return () => {
      if (typeof unsubscribeGroups === 'function') {
        unsubscribeGroups();
      }
    };
  }, []);

  // Fetch notifications from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const fetchNotifications = async () => {
      try {
        // Query unread notifications
        const notificationsQuery = query(
          collection(db, "users", auth.currentUser.uid, "notifications"),
          where("read", "==", false),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
          // Process notifications by type
          const unreadNotifs = [];
          const mentionNotifs = [];
          const friendRequestNotifs = [];
          
          querySnapshot.forEach(doc => {
            const notif = {
              id: doc.id,
              ...doc.data(),
              time: doc.data().createdAt instanceof Timestamp ? 
                formatTimeAgo(doc.data().createdAt.toDate()) : 
                "recently",
              text: doc.data().message || doc.data().text // Support both formats
            };
            
            // Add to appropriate category
            unreadNotifs.push(notif);
            
            if (notif.type === 'mention') {
              mentionNotifs.push(notif);
            } else if (notif.type === 'friend_request') {
              friendRequestNotifs.push(notif);
            }
          });
          
          setNotifications({
            unread: unreadNotifs,
            mentions: mentionNotifs,
            friendRequests: friendRequestNotifs
          });
        }, (error) => {
          console.error("Error fetching notifications:", error);
          // Fallback to mock data
          setMockNotifications();
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up notifications listener:", error);
        setMockNotifications();
        return () => {};
      }
    };
    
    // Fallback to mock notifications data
   
    
    const unsubscribeNotifications = fetchNotifications();
    
    return () => {
      if (typeof unsubscribeNotifications === 'function') {
        unsubscribeNotifications();
      }
    };
  }, []);

  // Helper function to format timestamps as "X time ago"
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  };

  const handleEditProfile = () => {
    setIsProfileCardOpen(true);
    setShowProfileDropdown(false);
  };

  // State to control profile dropdown visibility
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // After successful logout, redirect to login page
      navigate('/login');
      // Optional: Clear any local storage data
      localStorage.removeItem('lastActiveChat');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Helper function for truncating long names
  const truncateName = (name, maxLength = 10) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
  };

  // Helper function for generating initials
  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 1).toUpperCase() + 
        (name.length > 1 ? name.substring(1, 2).toLowerCase() : "");
    } else {
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
    if (!name) return pastelColors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % pastelColors.length;
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
    console.log(user);
    localStorage.setItem("lastActiveChat", JSON.stringify(user)); // Save the selected user
    navigate("/social", { state: { user } }); // Redirect to the Friends page
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
              <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
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
                  <button className="profile-dropdown-button" onClick={handleEditProfile}>
                    Edit Profile
                  </button>
                  <button className="profile-dropdown-button profile-logout" onClick={handleLogout}>
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
        <div className="dashboard" ref={containerRef}>
          <div className='sections'>
            <div className="section">
              <button onClick={() => navigate('/social')} className="dashboard-button">
                <h2>Friends</h2>
              </button>

              <div className="dashboard-friends">
                {loading ? (
                  <div className="loading-container p-5">
                    <div className="loading-spinner"></div>
                  </div>
                ) : friends.filter(friend => friend.isOnline).length === 0 ? (
                  <p className="text-[var(--text-secondary)] p-4">No friends online at the moment.</p>
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
                {loading ? (
                  <div className="loading-container p-5">
                    <div className="loading-spinner"></div>
                  </div>
                ) : groups.length === 0 ? (
                  <p className="text-[var(--text-secondary)] p-4">No groups found.</p>
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
              {notifications[activeTab]?.length === 0 ? (
                <div className="no-notifications p-4">
                  <p>No {activeTab} notifications</p>
                </div>
              ) : (
                notifications[activeTab]?.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <p className="notification-text">{notification.text || notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Profile
        isOpen={isProfileCardOpen} 
        onClose={() => setIsProfileCardOpen(false)} 
      />
    </div>
  );
}

export default Dashboard;