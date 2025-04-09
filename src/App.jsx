// src/App.jsx
import React from 'react';
import './App.css';
import './theme.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './firebase/FirebaseContext';
import { AuthProvider } from './contexts/AuthContext';

import Dashboard from './pages/Dashboard.jsx'
import Social from './pages/Social.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Tasks from './pages/Tasks.jsx';
import NoPage from './pages/NoPage.jsx';

import Sidebar from './components/Sidebar.jsx';
import { ThemeProvider } from './ThemeContext.jsx';

function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <div className='App'>
              <Sidebar/>
              <div className='Routes'>
                <Routes>
                  <Route index element = {<Social/>} />
                  <Route path="/dashboard" element = {<Dashboard />} />
                  <Route path="/social" element = {<Social />} />
                  <Route path="/profile" element = {<Profile />} />
                  <Route path="/settings" element = {<Settings />} />
                  <Route path="/tasks" element = {<Tasks />} />
                  <Route path="*" element = {<NoPage />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;