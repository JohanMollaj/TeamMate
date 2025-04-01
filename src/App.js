import React, { useEffect } from 'react';
import './App.css';
import './theme.css'; // Import our theme CSS
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Social from './pages/Social';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import NoPage from './pages/NoPage';

import Sidebar from './components/Sidebar';
import { ThemeProvider } from './ThemeContext'; 
import AuthLayout from './components/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Initialize default data if first-time app load
function initializeAppData() {
  const appInitialized = localStorage.getItem('appInitialized');
  const forceReinitialize = localStorage.getItem('forceReinitialize');
  
  // Check if any essential data is missing
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  const hasMessages = localStorage.getItem('messages') !== null;
  const hasTasks = localStorage.getItem('tasks') !== null;
  
  // Determine if initialization is needed
  const needsInitialization = !appInitialized || 
                             forceReinitialize === 'true' || 
                             users.length === 0 ||
                             !hasMessages || 
                             !hasTasks;
  
  if (needsInitialization) {
    console.log("App data needs initialization. Fetching default data...");
    
    // Clear the force flag if it exists
    if (forceReinitialize) {
      localStorage.removeItem('forceReinitialize');
    }
    
    // Set default users
    fetch('/users.json')
      .then(response => response.json())
      .then(defaultUsers => {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log("Default users initialized");
        
        // Initialize messages from JSON
        return fetch('/messages.json');
      })
      .then(response => response.json())
      .then(data => {
        // Convert the array format to our object format by user ID
        const messagesById = { "1": [] };
        
        data.forEach(message => {
          // Add unique IDs to messages
          const messageWithId = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          
          // Add to user's messages
          messagesById["1"].push(messageWithId);
        });
        
        localStorage.setItem('messages', JSON.stringify(messagesById));
        console.log("Messages initialized");
        
        // Initialize groups from JSON
        return fetch('/groups.json');
      })
      .then(response => response.json())
      .then(data => {
        // Enhance group data
        const enhancedGroups = data.map(group => ({
          ...group,
          chatType: 'group',
          members: ["1", "2", "3"],
          createdBy: "1",
          createdAt: new Date().toISOString(),
          description: "A project collaboration group"
        }));
        
        localStorage.setItem('groups', JSON.stringify(enhancedGroups));
        console.log("Groups initialized");
        
        // Initialize notifications
        return fetch('/notifications.json');
      })
      .then(response => response.json())
      .then(notifications => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
        console.log("Notifications initialized");
        
        // Initialize tasks
        return fetch('/tasks.json');
      })
      .then(response => response.json())
      .then(data => {
        // Convert tasks to user-specific format
        const tasksByUser = { "1": data.tasks };
        localStorage.setItem('tasks', JSON.stringify(tasksByUser));
        console.log("Tasks initialized");
        
        // Initialize graded tasks
        return fetch('/gradedTasks.json');
      })
      .then(response => response.json())
      .then(data => {
        // Convert to user-specific format
        const gradedTasksByUser = { "1": data.gradedAssignments };
        localStorage.setItem('gradedTasks', JSON.stringify(gradedTasksByUser));
        console.log("Graded tasks initialized");
        
        // Mark app as initialized
        localStorage.setItem('appInitialized', 'true');
        
        console.log('App data initialized successfully!');
        
        // Refresh the page to ensure all data is loaded properly
        if (forceReinitialize) {
          window.location.reload();
        }
      })
      .catch(err => {
        console.error('Error initializing app data:', err);
        // Clear the initialized flag so it will try again on next load
        localStorage.removeItem('appInitialized');
      });
  }
}

function App() {
  // Initialize app data on first load
  useEffect(() => {
    initializeAppData();
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes (no sidebar) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/welcome" element={<Welcome />} />
          </Route>
          
          {/* Protected routes (with sidebar) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={
              <div className='App'>
                <Sidebar />
                <div className='Routes'>
                  <Dashboard />
                </div>
              </div>
            } />
            
            <Route path="/dashboard" element={
              <div className='App'>
                <Sidebar />
                <div className='Routes'>
                  <Dashboard />
                </div>
              </div>
            } />
            
            <Route path="/social" element={
              <div className='App'>
                <Sidebar />
                <div className='Routes'>
                  <Social />
                </div>
              </div>
            } />
            
            <Route path="/profile" element={
              <div className='App'>
                <Sidebar />
                <div className='Routes'>
                  <Profile />
                </div>
              </div>
            } />
            
            <Route path="/settings" element={
              <div className='App'>
                <Sidebar />
                <div className='Routes'>
                  <Settings />
                </div>
              </div>
            } />
            
            <Route path="/tasks" element={
              <div className='App'>
                <Sidebar />
                <div className='Routes'>
                  <Tasks />
                </div>
              </div>
            } />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;