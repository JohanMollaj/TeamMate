import './settingsSidebar.css';
import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';


function Sidebar({ setActiveSetting, currentSetting }) {
  
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      localStorage.removeItem('lastActiveChat');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };


  return (
    
    <div className="settings-sidebar">
      <h1>Settings</h1>
      <div className="settings-section">
        <h2>User Settings</h2>
        <button
          onClick={() => setActiveSetting('MyAccount')}
          className={`sidebar-button ${currentSetting === 'MyAccount' ? 'active' : ''}`}
        >
          My Account
        </button>
        <button
          onClick={() => setActiveSetting('Profile')}
          className={`sidebar-button ${currentSetting === 'Profile' ? 'active' : ''}`}
        >
          Profile
        </button>
      </div>
      <div className="settings-section">
        <h2>App Settings</h2>
        <button
          onClick={() => setActiveSetting('Appearance')}
          className={`sidebar-button ${currentSetting === 'Appearance' ? 'active' : ''}`}
        >
          Appearance
        </button>
        <button
          onClick={() => setActiveSetting('Accessibility')}
          className={`sidebar-button ${currentSetting === 'Accessibility' ? 'active' : ''}`}
        >
          Accessibility
        </button>
      </div>
      <button
        className="sidebar-button logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
