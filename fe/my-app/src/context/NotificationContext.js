import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { getUserData } from '../utils/storage';
import { UI } from '../utils/constants';

// Create context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotifications, setToastNotifications] = useState([]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const response = await api.get('/api/notification/notifications');
      const notificationData = response.data || [];
      
      setNotifications(notificationData);
      
      // Count unread notifications
      const userData = getUserData();
      const userId = userData?.id;
      
      if (userId) {
        const unreadNotifications = notificationData.filter(
          notification => !notification.readBy || !notification.readBy.includes(userId)
        );
        setUnreadCount(unreadNotifications.length);
      }
      
      return notificationData;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setErrorMsg('Failed to load notifications');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const userData = getUserData();
      const userId = userData?.id;
      
      if (!userId) return false;
      
      // Make API call to mark as read
      await api.post(`/api/notification/mark-read/${notificationId}`);
      
      // Update local state
      setNotifications(prev => {
        const updated = prev.map(notification => {
          if (notification._id === notificationId) {
            const readBy = notification.readBy || [];
            if (!readBy.includes(userId)) {
              return {
                ...notification,
                readBy: [...readBy, userId]
              };
            }
          }
          return notification;
        });
        return updated;
      });
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const userData = getUserData();
      const userId = userData?.id;
      
      if (!userId) return false;
      
      // Make API call to mark all as read
      await api.post('/api/notification/mark-all-read');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          readBy: [...(notification.readBy || []), userId]
        }))
      );
      
      // Update unread count
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  // Initialize by fetching notifications once
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every minute
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // 60 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const addNotification = (notification) => {
    const id = Date.now();
    
    const newNotification = {
      id,
      ...notification,
      autoDismiss: notification.autoDismiss ?? true,
      dismissTimeout: notification.dismissTimeout ?? UI.TOAST_TIMEOUT,
    };
    
    setToastNotifications(prev => [...prev, newNotification]);
    
    if (newNotification.autoDismiss) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.dismissTimeout);
    }
    
    return id;
  };

  const removeNotification = (id) => {
    setToastNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setToastNotifications([]);
  };

  // Helper functions for different notification types
  const success = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options,
    });
  };

  const error = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      ...options,
    });
  };

  const warning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options,
    });
  };

  const info = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options,
    });
  };

  // Context value
  const value = {
    // API notifications
    notifications,
    loading,
    error: errorMsg,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    
    // Toast notifications
    toastNotifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    showError: error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// For backward compatibility
export const useNotification = useNotifications;

export default NotificationContext;
