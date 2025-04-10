import React, { useState, useEffect, useRef } from 'react';
import { useToast, TOAST_TYPES } from '../../context/ToastContext';
import './Toast.css';

const ToastItem = ({ toast, onClose }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [remaining, setRemaining] = useState(100);
  const progressBarRef = useRef(null);
  const timerRef = useRef(null);
  
  useEffect(() => {
    if (isRemoving) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isRemoving, toast.id, onClose]);

  useEffect(() => {

    if (toast.autoDismiss && progressBarRef.current) {
      // Start countdown
      const startTime = Date.now();
      const endTime = startTime + toast.autoDismissTimeout;
      
      const updateProgressBar = () => {
        const now = Date.now();
        const remainingTime = Math.max(0, endTime - now);
        const percent = (remainingTime / toast.autoDismissTimeout) * 100;
        
        setRemaining(percent);
        
        if (percent > 0) {
          timerRef.current = requestAnimationFrame(updateProgressBar);
        }
      };
      
      timerRef.current = requestAnimationFrame(updateProgressBar);
    }
    
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [toast.autoDismiss, toast.autoDismissTimeout]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleClose = () => {
    setIsRemoving(true);
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return <i className="bi bi-check-circle-fill"></i>;
      case TOAST_TYPES.ERROR:
        return <i className="bi bi-x-circle-fill"></i>;
      case TOAST_TYPES.WARNING:
        return <i className="bi bi-exclamation-triangle-fill"></i>;
      case TOAST_TYPES.INFO:
      default:
        return <i className="bi bi-info-circle-fill"></i>;
    }
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }
  };

  const resumeTimer = () => {
    if (toast.autoDismiss && !isRemoving) {
      const remainingTime = (remaining / 100) * toast.autoDismissTimeout;
      const endTime = Date.now() + remainingTime;
      
      const updateProgressBar = () => {
        const now = Date.now();
        const timeLeft = Math.max(0, endTime - now);
        const percent = (timeLeft / toast.autoDismissTimeout) * 100;
        
        setRemaining(percent);
        
        if (percent > 0) {
          timerRef.current = requestAnimationFrame(updateProgressBar);
        } else {
          handleClose();
        }
      };
      
      timerRef.current = requestAnimationFrame(updateProgressBar);
    }
  };

  return (
    <div 
      className={`toast-item toast-${toast.type} ${isRemoving ? 'removing' : ''}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-content">
        {toast.title && (
          <h4 className="toast-title">{toast.title}</h4>
        )}
        <p className="toast-message">{toast.message}</p>
        {toast.autoDismiss && (
          <div className="toast-progress-container">
            <div 
              ref={progressBarRef}
              className="toast-progress-bar" 
              style={{ width: `${remaining}%` }}
            />
          </div>
        )}
      </div>
      {!toast.autoDismiss && (
        <button
          className="toast-close"
          onClick={handleClose}
          aria-label="Close toast"
        >
          <i className="bi bi-x"></i>
        </button>
      )}
    </div>
  );
};

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default Toast; 