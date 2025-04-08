import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { getUserData } from '../utils/storage';
import { API_ROUTES } from '../utils/constants';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const userData = getUserData();
      if (!userData || !userData.id) {
        console.log('User not authenticated, skipping notification fetch');
        setNotifications([]);
        setUnreadCount(0);
        return [];
      }
      
      setLoading(true);
      setErrorMsg(null);
      
      const response = await api.get(API_ROUTES.NOTIFICATION.GET_ALL);
      const notificationData = response.data || [];
      
      setNotifications(notificationData);
      
      const userId = userData.id;
      const unreadNotifications = notificationData.filter(
        notification => !notification.readBy || !notification.readBy.includes(userId)
      );
      setUnreadCount(unreadNotifications.length);
      
      return notificationData;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      if (err.response && err.response.status === 401) {
        console.log('Authorization error when fetching notifications');
        setNotifications([]);
        setUnreadCount(0);
      } else {
        setErrorMsg('Failed to load notifications');
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const userData = getUserData();
      const userId = userData?.id;
      
      if (!userId) return false;
      
      await api.post(API_ROUTES.NOTIFICATION.MARK_READ(notificationId));
      
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
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const userData = getUserData();
      const userId = userData?.id;
      
      if (!userId) return false;
      
      await api.post(API_ROUTES.NOTIFICATION.MARK_ALL_READ);
      
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          readBy: [...(notification.readBy || []), userId]
        }))
      );
      
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (getUserData()) {
      fetchNotifications();
      
      const intervalId = setInterval(() => {
        if (getUserData()) {
          fetchNotifications();
        }
      }, 60000); 
      
      return () => clearInterval(intervalId);
    }
  }, [fetchNotifications]);

  const value = {
    notifications,
    loading,
    error: errorMsg,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const useNotification = useNotifications;

export default NotificationContext;
