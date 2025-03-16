import React, { useState } from 'react';
import InputField from '../inputField/InputField';
import './PasswordInput.css';

const PasswordInput = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  name,
  error,
  required,
  size = 'medium',
  variant = 'outlined',
  fullWidth = true,
  className
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const PasswordToggle = () => (
    <button
      type="button"
      onClick={toggleShowPassword}
      className="password-input__toggle"
      aria-label="Toggle password visibility"
    >
      {showPassword ? (
        <i className="bi bi-eye-slash"></i>
      ) : (
        <i className="bi bi-eye"></i>
      )}
    </button>
  );

  return (
    <div className={`password-input ${className || ''}`}>
      <InputField
        id={name}
        name={name}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        label={label}
        error={error}
        required={required}
        size={size}
        variant={variant}
        fullWidth={fullWidth}
        endAdornment={<PasswordToggle />}
      />
    </div>
  );
};

export default PasswordInput;
