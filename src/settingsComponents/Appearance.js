import React, { useContext } from 'react';
import { ThemeContext } from '../ThemeContext.jsx'; // Make sure to include the .js extension
import './appearance.css';
import { Moon, Sun } from 'lucide-react';

function Appearance() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <div className='settingsContainer'>
      <h1>Appearance</h1>
      
      <div className="settings-section">
        <h2>Theme</h2>
        <div className="theme-selection">
          <div className="theme-option-container">
            <div 
              className={`theme-option ${theme === 'dark' ? 'selected' : ''}`}
              onClick={() => theme === 'light' && toggleTheme()}
            >
              <div className="theme-preview dark-preview">
                <Moon size={24} />
              </div>
              <div className="theme-label">Dark</div>
              {theme === 'dark' && <div className="theme-selected-indicator"></div>}
            </div>
            
            <div 
              className={`theme-option ${theme === 'light' ? 'selected' : ''}`}
              onClick={() => theme === 'dark' && toggleTheme()}
            >
              <div className="theme-preview light-preview">
                <Sun size={24} />
              </div>
              <div className="theme-label">Light</div>
              {theme === 'light' && <div className="theme-selected-indicator"></div>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="theme-description">
        <p>Choose between dark and light mode for your interface.</p>
        <p>Your theme preference will be saved and applied across all your devices.</p>
      </div>
      
      <div className="settings-section">
        <h2>Font Size</h2>
        <div className="font-size-slider">
          <span className="font-size-label small">A</span>
          <input 
            type="range" 
            min="1" 
            max="5" 
            defaultValue="3" 
            className="slider" 
            id="fontSizeSlider" 
          />
          <span className="font-size-label large">A</span>
        </div>
        <p className="setting-note">This feature will be available soon.</p>
      </div>
    </div>
  );
}

export default Appearance;