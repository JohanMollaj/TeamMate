import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './welcome.css';

function Welcome() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(user);
    setLoading(false);
    
    // Auto-redirect to dashboard after a delay
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="welcome-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <img src="/logo-dark.png" alt="TeamMate Logo" className="welcome-logo" />
        <h1>Welcome, {currentUser.name}!</h1>
        <p className="welcome-message">
          You've successfully signed in to TeamMate. You'll be redirected to your dashboard in a moment.
        </p>
        <button 
          className="go-to-dashboard-button"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}

export default Welcome;