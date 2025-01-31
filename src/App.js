import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
        <div className='App'>
          <Sidebar/>
          <div className='Routes'>
            <Routes>
              <Route index  element = {<Settings/>} />
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
  );
}

export default App;
