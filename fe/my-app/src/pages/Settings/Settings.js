import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Settings.css';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-page">
      <h2>Cài đặt</h2>
      
      <div className="settings-section">
        <h3>Tài khoản</h3>
        <div className="setting-item">
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 