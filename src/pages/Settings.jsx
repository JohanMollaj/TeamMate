import './settings.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../settingsComponents/settingsSidebar.jsx';
import MyAccount from '../settingsComponents/MyAccount.jsx';
import Profile from '../settingsComponents/Profile.jsx';
import Appearance from '../settingsComponents/Appearance.jsx';
import Accessibility from '../settingsComponents/Accessibility.jsx';

export default function SettingsPage() {
    const navigate = useNavigate();
    const [activeSetting, setActiveSetting] = useState('Profile');

    const renderContent = () => {
        switch (activeSetting) {
            case 'MyAccount':
                return <MyAccount />;
            case 'Profile':
                return <Profile />;
            case 'Appearance':
                return <Appearance />;
            case 'Accessibility':
                return <Accessibility />;
            default:
                return <MyAccount />;
        }
    };

    return (
        <div className="container-settings">
            <div className="settings">
                {/* Pass both setActiveSetting and activeSetting */}
                <Sidebar setActiveSetting={setActiveSetting} currentSetting={activeSetting} />
                <div className="settings-content">{renderContent()}</div>
            </div>
        </div>
    );
}
