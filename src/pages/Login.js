import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get users from localStorage or initialize empty array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user by email
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found. Please check your email or register.');
      }

      // Check password
      if (user.password !== password) {
        throw new Error('Incorrect password. Please try again.');
      }

      // Login successful
      const currentTime = new Date().toISOString();
      
      // Update user's online status
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return { ...u, isOnline: true, lastLogin: currentTime };
        }
        return u;
      });
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Store current user in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isOnline: true,
        lastLogin: currentTime
      }));

      // Generate login notification
      addNotification({
        type: 'system',
        title: 'Welcome back!',
        message: `You logged in successfully at ${new Date().toLocaleTimeString()}.`,
        time: currentTime,
        read: false
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add notification for user
  const addNotification = (notification) => {
    const userId = JSON.parse(localStorage.getItem('users') || '[]')
      .find(u => u.email === email)?.id;
    
    if (!userId) return;
      
    const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
    
    if (!notifications[userId]) {
      notifications[userId] = [];
    }
    
    // Add notification with unique ID
    notifications[userId].unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification
    });
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo-dark.png" alt="TeamMate Logo" className="auth-logo" />
          <h1>Login to TeamMate</h1>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button 
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;