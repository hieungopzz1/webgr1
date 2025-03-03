import React, { useState } from 'react';
import './PasswordInput.css';

const PasswordInput = ({ label, placeholder, value, onChange, name }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="password-input">
      {label && <label htmlFor={name}>{label}</label>}
      <div className="password-input__wrapper">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="password-input__field"
        />
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
      </div>
    </div>
  );
};

export default PasswordInput;
