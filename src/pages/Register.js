import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './auth.css';
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaSpinner } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Password validation
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register({
        name,
        username,
        email,
        password
      });
      
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-logo">
          <img src="/logo-dark.png" alt="TeamMate Logo" />
          <h1>TeamMate</h1>
        </div>
        
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">Join the TeamMate community</p>
        
        {(error || formError) && (
          <div className="auth-error">
            {formError || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-container">
              <FaUser className="input-icon" />
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-container">
              <FaIdCard className="input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-container">
              <FaEnvelope className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <FaLock className="input-icon" />
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-container">
              <FaLock className="input-icon" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner" />
                Creating Account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;