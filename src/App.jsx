// src/App.jsx
import React from 'react';
import './App.css';
import './theme.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './firebase/FirebaseContext';
import { AuthProvider } from './firebase/AuthContext';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// App Pages
import Dashboard from './pages/Dashboard.jsx'
import Social from './pages/Social.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Tasks from './pages/Tasks.jsx';
import NoPage from './pages/NoPage.jsx';

// Components
import Sidebar from './components/Sidebar.jsx';
import AuthGuard from './components/AuthGuard';
import { ThemeProvider } from './ThemeContext.jsx';

function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <AuthGuard>
                  <div className='App'>
                    <Sidebar />
                    <div className='Routes'>
                      <Routes>
                        <Route index element={<Social />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/social" element={<Social />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="*" element={<NoPage />} />
                      </Routes>
                    </div>
                  </div>
                </AuthGuard>
              } />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;