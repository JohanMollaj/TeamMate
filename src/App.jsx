import React from 'react';
import './App.css';
import './theme.css'; // Import our theme CSS
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard.jsx'
import Social from './pages/Social.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Tasks from './pages/Tasks.jsx';
import NoPage from './pages/NoPage.jsx';

import Sidebar from './components/Sidebar.jsx';
import { ThemeProvider } from './ThemeContext.jsx'; // Make sure to include the .js extension


function App() {
  return (
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
  );
}

export default App;
