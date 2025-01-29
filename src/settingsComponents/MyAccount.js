import React from 'react';
import './myAccount.css';

function MyAccount() {
  return (
    <div>
      <h1>My Account</h1>
      <div className="settings-section">
        <h2>Display Name</h2>
        <p>[display name]</p>
      </div>
      <div className="settings-section">
        <h2>Username</h2>
        <p>[username]</p>
      </div>
      <div className="settings-section">
        <h2>Email</h2>
        <p>[example@example.com]</p>
      </div>
      <button className="settings-button">Change Password</button>
      <button className="delete-button">Delete Account</button>
    </div>
  );
}

export default MyAccount;