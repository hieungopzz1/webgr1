import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/modal/Modal';
import Loader from '../../components/loader/Loader';
import useNotifications from '../../hooks/useNotifications';
import { getUserData } from '../../utils/storage';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead,
    markAllAsRead 
  } = useNotifications();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  const getNotificationIcon = (title) => {
    if (title.includes('Class Schedule') || title.includes('Online Class'))
      return <i className="bi bi-calendar-event-fill"></i>;
    if (title.includes('Google Meet'))
      return <i className="bi bi-camera-video-fill"></i>;
    if (title.includes('Assignment') || title.includes('Submission'))
      return <i className="bi bi-file-earmark-text-fill"></i>;
    if (title.includes('Welcome'))
      return <i className="bi bi-emoji-smile-fill"></i>;
    
    return <i className="bi bi-bell-fill"></i>;
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markAsRead(notification._id);
      await fetchNotifications();
      onClose();
      
      if (notification.title.includes('Class Schedule') || 
          notification.title.includes('Online Class') || 
          notification.title.includes('Google Meet')) {
        navigate('/user-timetable');
      } else if (notification.title.includes('Assignment Uploaded')) {
        navigate('/user-document');
      } else if (notification.title.includes('Submission Received')) {
        navigate('/document');
      } else if (notification.title.includes('Welcome')) {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await fetchNotifications();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  const isRead = notification => {
    const userData = getUserData();
    const userId = userData?.id;
    return notification.readBy && notification.readBy.includes(userId);
  };

  const hasUnreadNotifications = notifications.some(notification => !isRead(notification));

  const renderContent = () => {
    if (loading) {
      return (
        <div className="notification-loading">
          <Loader />
          <p>Loading notifications...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="notification-error">
          <i className="bi bi-exclamation-triangle"></i>
          <p>{typeof error === 'function' ? 'Error loading notifications' : error}</p>
        </div>
      );
    }
    
    if (notifications.length === 0) {
      return (
        <div className="notification-empty">
          <i className="bi bi-bell-slash"></i>
          <p>You don't have any notifications yet</p>
        </div>
      );
    }
    
    return (
      <>
        {hasUnreadNotifications && (
          <div className="notification-actions">
            <button 
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          </div>
        )}
        <ul className="notification-list">
          {notifications.map(notification => (
            <li 
              key={notification._id}
              className={`notification-item ${isRead(notification) ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.title)}
              </div>
              <div className="notification-content">
                <h4 className="notification-title">{notification.title}</h4>
                <p className="notification-message">{notification.content}</p>
                <span className="notification-time">{formatDate(notification.timestamp)}</span>
              </div>
              {!isRead(notification) && <span className="notification-badge"></span>}
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="notification-modal-container">
        {renderContent()}
      </div>
    </Modal>
  );
};

export default NotificationModal; 