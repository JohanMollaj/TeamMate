import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Landing from './pages/Landing.js';
import Dashboard from './pages/Dashboard.js'
import Social from './pages/Social.js';
import Profile from './pages/Profile.js';
import Settings from './pages/Settings.js';
import Tasks from './pages/Tasks.js';
import NoPage from './pages/NoPage.js';

import Sidebar from './components/Sidebar.js';


function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const showSidebar = !["/", ""].includes(location.pathname);

  return (
    <div className='App'>
      {showSidebar && <Sidebar />}
      <div className='Routes'>
        <Routes>
          <Route index element={<Landing />} />
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/social" element={<Social />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
