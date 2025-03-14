import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { AuthContext } from '../../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { language, setLanguage } = useLanguage();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

      <div className="settings-section">
        <h3 className="settings-section-title">Account</h3>
        <div className="settings-item">
          <button 
            onClick={handleLogout}
            className="settings-logout-button"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 