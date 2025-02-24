import React from 'react';
import './profile.css';

function Profile() {
  return (
    <div>
      <div className='settingsContainer'>
      <h1>Profile</h1>
      <div className="settings-section">
        <h2>Display Name</h2>
        <input type="text" placeholder="Enter your display name" />
      </div>
      <div className="settings-section">
        <h2>Username</h2>
        <input type="text" placeholder="Enter your username" />
      </div>
      <div className="settings-section">
        <h2>About Me</h2>
        <textarea className="aboutme" type="text" placeholder="Write something about yourself" />
      </div>
      <div className="settings-section">
        <h2>Qualifications</h2>
        <textarea type="text" placeholder="Write your qualifications" />
      </div>
      <button className="settings-button">Save</button>
      </div>
    </div>
  );
}

export default Profile;