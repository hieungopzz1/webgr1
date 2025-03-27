import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  className = '', 
  disabled = false,
  variant = 'primary', // primary, secondary, outline, danger
  size = 'medium', // small, medium, large
  fullWidth = false,
  noHover = false,
  icon = null // optional icon component
}) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`
        custom-button 
        custom-button--${variant} 
        custom-button--${size}
        ${fullWidth ? 'custom-button--full-width' : ''}
        ${noHover ? 'custom-button--no-hover' : ''}
        ${className}
      `} 
      disabled={disabled}
    >
      {icon && <span className="custom-button__icon">{icon}</span>}
      <span className="custom-button__text">{children}</span>
    </button>
  );
};

export default Button;
