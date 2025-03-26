import React, { createContext, useContext, useReducer } from 'react';
import { UI } from '../utils/constants';

const ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL',
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_NOTIFICATION:
      return [...state, action.payload];
    
    case ACTIONS.REMOVE_NOTIFICATION:
      return state.filter(notification => notification.id !== action.payload);
    
    case ACTIONS.CLEAR_ALL:
      return [];
    
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      autoDismiss: true,
      autoDismissTimeout: UI.TOAST_AUTO_DISMISS_TIME,
      ...notification,
      timestamp: new Date(),
    };
    
    dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: newNotification });
    
    if (newNotification.autoDismiss) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.autoDismissTimeout);
    }
    
    return id;
  };

  const removeNotification = (id) => {
    dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: ACTIONS.CLEAR_ALL });
  };

  const success = (message, options = {}) => {
    return addNotification({ 
      type: NOTIFICATION_TYPES.SUCCESS, 
      message,
      ...options 
    });
  };

  const error = (message, options = {}) => {
    return addNotification({ 
      type: NOTIFICATION_TYPES.ERROR, 
      message,
      ...options 
    });
  };

  const warning = (message, options = {}) => {
    return addNotification({ 
      type: NOTIFICATION_TYPES.WARNING, 
      message,
      ...options 
    });
  };

  const info = (message, options = {}) => {
    return addNotification({ 
      type: NOTIFICATION_TYPES.INFO, 
      message,
      ...options 
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
