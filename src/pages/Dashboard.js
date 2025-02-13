import './Dashboard.css';
import { FaUserCircle, FaUsers } from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';

function useHasScrollbar(ref) {
    const [hasScrollbar, setHasScrollbar] = useState(false);
  
    useEffect(() => {
      if (!ref.current) return;
  
      const updateScrollbar = () => {
        const element = ref.current;
        setHasScrollbar(element.scrollHeight > element.clientHeight);
      };
  
      updateScrollbar();
  
      const resizeObserver = new ResizeObserver(updateScrollbar);
      resizeObserver.observe(ref.current);
  
      return () => resizeObserver.disconnect();
    }, [ref]);
  
    return hasScrollbar;
  }

function Dashboard(){
    const navigate  = useNavigate();

    const containerRef = useRef(null);
    const hasScrollbar = useHasScrollbar(containerRef);

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
                style={{
                    borderRadius: hasScrollbar ? '45px 0 0 45px' : '45px',
                    transition: 'border-radius 0.2s'
                  }}>
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
                    <p>You have finished all your tasks!</p>
                    </div>
                </div>
            </div>
    )
}

export default Dashboard;