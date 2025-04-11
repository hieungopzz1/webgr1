import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserData } from '../utils/storage';
import { ROUTES } from '../utils/constants';
import Button from '../components/button/Button';
import './NotFound.css';

const NotFound = () => {
  const location = useLocation();
  const user = getUserData();
  const userRole = user?.role || 'guest';
  
  const getDashboardUrl = () => {
    if (!user) return ROUTES.LOGIN;
    return ROUTES.DASHBOARD(userRole);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        
        <h1>Access Denied</h1>
        
        <div className="not-found-message">
          <p>
            <strong>Error 403:</strong> You don't have permission to access this page{' '}
            <span className="highlight">{location.pathname}</span>
          </p>
          
          <p>
            Your account <strong>({userRole})</strong> doesn't have permission to access 
            this page. Please contact the administrator if you believe this is an error.
          </p>
        </div>
        
        <div className="not-found-actions">
          <Link to={getDashboardUrl()}>
            <Button variant="primary">
              Return to Dashboard
            </Button>
          </Link>
          
          <Link to={ROUTES.HOME}>
            <Button variant="secondary">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
