import './sidebar.css';
import { FaHome, FaSearch, FaClipboardList, FaUserCircle, FaCog} from 'react-icons/fa';
import { FaUserGroup } from "react-icons/fa6";
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Sidebar() {
    const navigate  = useNavigate();

    return(
        <div>
            {/* Sidebar */} 
            <div className="sidebar">
                <div className='sidebarTop'>
                    <div className="project-icon">
                        <img className='logo' alt="" src = "/logo-light.png"/>
                    </div>
                    <nav className="sidebar-icons">
                        <button onClick={() => navigate('/dashboard')} className="icon-button">
                            <FaHome className="icon" />
                        </button>

                        <button onClick={() => navigate('/friends')} className="icon-button">
                            <FaUserGroup className="icon" />
                        </button>

                        <button onClick={() => navigate('/tasks')} className="icon-button">
                            <FaClipboardList className="icon" />
                        </button>
                    </nav>
                </div>
                    <div className='sidebarBottom'>
                        <div className="sidebar-footer">
                            <button onClick={() => navigate('/profile')} className="icon-button">
                                <FaUserCircle className="icon" />
                            </button>
                            
                            <button onClick={() => navigate('/settings')} className="icon-button">
                                <FaCog className="icon" />
                            </button>
                        </div>
                    </div>
            </div>
        </div>
    )
  }
  
  export default Sidebar;