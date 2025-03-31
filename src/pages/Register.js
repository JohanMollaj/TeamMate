import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import './auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Basic password strength check
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Username format validation (no spaces, special characters limited)
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username can only contain letters, numbers, dots, and underscores.');
      return;
    }

    setLoading(true);

    try {
      // Get existing users or initialize empty array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (users.some(user => user.email === formData.email)) {
        throw new Error('Email already registered. Please login instead.');
      }
      
      // Check if username already exists
      if (users.some(user => user.username === formData.username)) {
        throw new Error('Username already taken. Please choose another one.');
      }
      
      // Create new user
      const currentTime = new Date().toISOString();
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password, // In a real app, this would be hashed
        bio: "I'm new to TeamMate!",
        profilePicture: null,
        isOnline: true,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        lastLogin: currentTime,
        friends: [],
        friendRequests: []
      };
      
      // Add user to array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Store current user in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        profilePicture: newUser.profilePicture,
        isOnline: true,
        lastLogin: currentTime,
        joinDate: newUser.joinDate
      }));

      // Generate welcome notification
      const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
      
      notifications[newUser.id] = [{
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'system',
        title: 'Welcome to TeamMate!',
        message: 'We\'re excited to have you join us. Start by exploring the dashboard and connecting with friends.',
        time: currentTime,
        read: false
      }];
      
      localStorage.setItem('notifications', JSON.stringify(notifications));

      // Initialize empty messages for the user
      initializeUserData(newUser.id);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize necessary data structures for new user
  const initializeUserData = (userId) => {
    // Initialize empty messages
    const messages = JSON.parse(localStorage.getItem('messages') || '{}');
    messages[userId] = [];
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // Add some default users as potential friends
    addDefaultFriends(userId);
  };

  // Add default friends for new users to have some data to play with
  const addDefaultFriends = (userId) => {
    // Add a system user that sends a welcome message
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find or create the TeamMate system user
    let systemUser = users.find(u => u.username === 'teammate');
    
    if (!systemUser) {
      systemUser = {
        id: 'system_user',
        name: 'TeamMate Support',
        username: 'teammate',
        email: 'support@teammate.com',
        password: 'unguessable_password',
        bio: 'Official TeamMate support account',
        profilePicture: '/logo-dark.png',
        isOnline: true,
        joinDate: 'January 2023',
        lastLogin: new Date().toISOString()
      };
      
      users.push(systemUser);
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Send welcome message from system user
    const messages = JSON.parse(localStorage.getItem('messages') || '{}');
    
    if (!messages[userId]) messages[userId] = [];
    
    // Add welcome message
    messages[userId].push({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderID: systemUser.id,
      receiverID: userId,
      type: 'direct',
      time: new Date().toISOString(),
      message: `Welcome to TeamMate! I'm your support assistant. If you need any help, feel free to message me.`
    });
    
    localStorage.setItem('messages', JSON.stringify(messages));
  };

  return (
    <div className="auth-container">
      <div className="auth-card register">
        <div className="auth-header">
          <img src="/logo-dark.png" alt="TeamMate Logo" className="auth-logo" />
          <h1>Create Your Account</h1>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;