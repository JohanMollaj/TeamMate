import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/auth');
        setCurrentUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkUserStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
      // Get user data
      const userResponse = await api.get('/auth');
      setCurrentUser(userResponse.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setError(error.response?.data?.msg || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      
      // Get user data
      const userResponse = await api.get('/auth');
      setCurrentUser(userResponse.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setError(error.response?.data?.msg || 'Registration failed. Please try again.');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await api.put('/users/profile', profileData);
      setCurrentUser(response.data);
      return true;
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update profile');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};