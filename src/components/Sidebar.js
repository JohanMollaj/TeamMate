import './sidebar.css';
import { FaHome, FaClipboardList, FaUserCircle, FaCog} from 'react-icons/fa';
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

                        <button onClick={() => navigate('/social')} className="icon-button">
                            <FaUserGroup className="icon" />
                        </button>

                        <button onClick={() => navigate('/tasks')} className="icon-button">
                            <FaClipboardList className="icon" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    )
  }
  
  export default Sidebar;