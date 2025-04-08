/**
 * Toast utility wrapper
 * 
 * This file provides standalone toast functions that can be used directly
 * without importing useToast hook, similar to toast libraries like react-toastify.
 */

import { TOAST_TYPES } from '../context/ToastContext';

let toastContextValue = null;

/**
 * Registers the toast context value to be used by standalone toast functions.
 * This should be called from a component that has access to the ToastProvider.
 * 
 * @param {Object} contextValue - The value returned by useToast()
 */
export const registerToastContext = (contextValue) => {
  toastContextValue = contextValue;
};

/**
 * Shows a toast notification with default settings
 * 
 * @param {string} message - Toast message text
 * @param {Object} options - Additional toast options 
 * @returns {string|null} The toast ID or null if toast context isn't available
 */
export const toast = (message, options = {}) => {
  if (!toastContextValue) {
    console.warn('Toast context not available. Make sure ToastProvider is properly set up.');
    return null;
  }
  
  return toastContextValue.addToast({
    message,
    ...options
  });
};

/**
 * Shows a success toast notification
 * 
 * @param {string} message - Toast message text
 * @param {Object} options - Additional toast options 
 * @returns {string|null} The toast ID or null if toast context isn't available
 */
export const success = (message, options = {}) => {
  if (!toastContextValue) {
    console.warn('Toast context not available. Make sure ToastProvider is properly set up.');
    return null;
  }
  
  return toastContextValue.success(message, options);
};

/**
 * Shows an error toast notification
 * 
 * @param {string} message - Toast message text
 * @param {Object} options - Additional toast options 
 * @returns {string|null} The toast ID or null if toast context isn't available
 */
export const error = (message, options = {}) => {
  if (!toastContextValue) {
    console.warn('Toast context not available. Make sure ToastProvider is properly set up.');
    return null;
  }
  
  return toastContextValue.error(message, options);
};

/**
 * Shows a warning toast notification
 * 
 * @param {string} message - Toast message text
 * @param {Object} options - Additional toast options 
 * @returns {string|null} The toast ID or null if toast context isn't available
 */
export const warning = (message, options = {}) => {
  if (!toastContextValue) {
    console.warn('Toast context not available. Make sure ToastProvider is properly set up.');
    return null;
  }
  
  return toastContextValue.warning(message, options);
};

/**
 * Shows an info toast notification
 * 
 * @param {string} message - Toast message text
 * @param {Object} options - Additional toast options 
 * @returns {string|null} The toast ID or null if toast context isn't available
 */
export const info = (message, options = {}) => {
  if (!toastContextValue) {
    console.warn('Toast context not available. Make sure ToastProvider is properly set up.');
    return null;
  }
  
  return toastContextValue.info(message, options);
};

/**
 * Manually removes a toast notification by ID
 * 
 * @param {string} id - The toast ID to remove
 */
export const dismiss = (id) => {
  if (!toastContextValue) {
    console.warn('Toast context not available. Make sure ToastProvider is properly set up.');
    return;
  }
  
  toastContextValue.removeToast(id);
};

/**
 * Removes all current toast notifications
 */
export const dismissAll = () => {
  if (!toastContextValue) {
    console.warn('Toast context not available. Make sure ToastProvider is properly set up.');
    return;
  }
  
  toastContextValue.clearToasts();
};

// Export all toast types for convenience
export { TOAST_TYPES }; 