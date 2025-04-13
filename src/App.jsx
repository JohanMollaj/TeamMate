import React from 'react';
import './App.css';
import './theme.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard.jsx'
import Social from './pages/Social.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Tasks from './pages/Tasks.jsx';
import NoPage from './pages/NoPage.jsx';
import Login from './pages/Login.jsx'; // Create this page
import Signup from './pages/Signup.jsx'; // Create this page

import Sidebar from './components/Sidebar.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Protected route component
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <PrivateRoute>
                <div className='App'>
                  <Sidebar />
                  <div className='Routes'>
                    <Social />
                  </div>
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <div className='App'>
                  <Sidebar />
                  <div className='Routes'>
                    <Dashboard />
                  </div>
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/social" element={
              <PrivateRoute>
                <div className='App'>
                  <Sidebar />
                  <div className='Routes'>
                    <Social />
                  </div>
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <div className='App'>
                  <Sidebar />
                  <div className='Routes'>
                    <Profile />
                  </div>
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/settings" element={
              <PrivateRoute>
                <div className='App'>
                  <Sidebar />
                  <div className='Routes'>
                    <Settings />
                  </div>
                </div>
              </PrivateRoute>
            } />
            
            <Route path="/tasks" element={
              <PrivateRoute>
                <div className='App'>
                  <Sidebar />
                  <div className='Routes'>
                    <Tasks />
                  </div>
                </div>
              </PrivateRoute>
            } />
            
            <Route path="*" element={<NoPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;