import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Settings.css';

const Settings = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>
      
      <div className="settings-section">
        <h3 className="settings-section-title">Language</h3>
        <div className="settings-item">
          <label className="settings-label">Select Language:</label>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="settings-select"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings; 