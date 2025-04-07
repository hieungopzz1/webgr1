import { useNotifications as useNotificationsContext } from '../context/NotificationContext';

const useNotifications = () => {
  const notificationContext = useNotificationsContext();
  
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = notificationContext;
  
  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};

export default useNotifications; 