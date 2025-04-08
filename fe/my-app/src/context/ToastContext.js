import React, { createContext, useContext, useReducer } from 'react';
import { UI } from '../utils/constants';

const ACTIONS = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_ALL: 'CLEAR_ALL',
};

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const TOAST_TIMEOUTS = {
  [TOAST_TYPES.SUCCESS]: 3000,  
  [TOAST_TYPES.ERROR]: 5000,    
  [TOAST_TYPES.WARNING]: 4000,  
  [TOAST_TYPES.INFO]: 3000,     
};

const ToastContext = createContext();

const toastReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_TOAST:
      return [...state, action.payload];
    
    case ACTIONS.REMOVE_TOAST:
      return state.filter(toast => toast.id !== action.payload);
    
    case ACTIONS.CLEAR_ALL:
      return [];
    
    default:
      return state;
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (toast) => {
    const id = Date.now().toString();
    const toastType = toast.type || TOAST_TYPES.INFO;
    
    const defaultTimeout = TOAST_TIMEOUTS[toastType] || UI.TOAST_AUTO_DISMISS_TIME;
    
    const newToast = {
      id,
      type: toastType,
      autoDismiss: toast.autoDismiss !== false, 
      autoDismissTimeout: toast.autoDismissTimeout || defaultTimeout,
      ...toast,
      timestamp: new Date(),
    };
    
    dispatch({ type: ACTIONS.ADD_TOAST, payload: newToast });
    
    if (newToast.autoDismiss) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.autoDismissTimeout);
    }
    
    return id;
  };

  const removeToast = (id) => {
    dispatch({ type: ACTIONS.REMOVE_TOAST, payload: id });
  };

  const clearToasts = () => {
    dispatch({ type: ACTIONS.CLEAR_ALL });
  };

  const success = (message, options = {}) => {
    return addToast({ 
      type: TOAST_TYPES.SUCCESS, 
      message,
      ...options 
    });
  };

  const error = (message, options = {}) => {
    return addToast({ 
      type: TOAST_TYPES.ERROR, 
      message,
      ...options 
    });
  };

  const warning = (message, options = {}) => {
    return addToast({ 
      type: TOAST_TYPES.WARNING, 
      message,
      ...options 
    });
  };

  const info = (message, options = {}) => {
    return addToast({ 
      type: TOAST_TYPES.INFO, 
      message,
      ...options 
    });
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearToasts,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastContext;