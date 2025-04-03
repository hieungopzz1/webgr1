import React, { useEffect } from 'react';
import { useNotification, NOTIFICATION_TYPES } from '../../context/NotificationContext';
import './Notification.css';

const NotificationItem = ({ notification, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose(notification.id);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [notification.id, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <i className="bi bi-check-circle-fill"></i>;
      case NOTIFICATION_TYPES.ERROR:
        return <i className="bi bi-x-circle-fill"></i>;
      case NOTIFICATION_TYPES.WARNING:
        return <i className="bi bi-exclamation-triangle-fill"></i>;
      case NOTIFICATION_TYPES.INFO:
      default:
        return <i className="bi bi-info-circle-fill"></i>;
    }
  };

  return (
    <div className={`notification-item notification-${notification.type}`}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        {notification.title && (
          <h4 className="notification-title">{notification.title}</h4>
        )}
        <p className="notification-message">{notification.message}</p>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default Notifications;