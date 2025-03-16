import React from 'react';
import './InputField.css';

const InputField = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  error,
  className = '',
  maxLength,
  characterCount,
  startAdornment,
  endAdornment,
  multiline = false,
  rows = 3,
  size = 'medium',
  variant = 'outlined',
  fullWidth = false,
  required = false,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  ...props
}) => {
  const InputComponent = multiline ? 'textarea' : 'input';
  
  const baseClassName = `input-field ${className} ${size} ${variant} ${fullWidth ? 'full-width' : ''}`;
  
  return (
    <div className={baseClassName}>
      {label && (
        <label htmlFor={name} className={required ? 'required' : ''}>
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {startAdornment && (
          <div className="input-adornment start">{startAdornment}</div>
        )}
        <InputComponent
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          rows={multiline ? rows : undefined}
          className={error ? 'error' : ''}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          required={required}
          {...props}
        />
        {endAdornment && (
          <div className="input-adornment end">{endAdornment}</div>
        )}
      </div>
      {characterCount && (
        <span className="character-count">
          {typeof characterCount === 'string' ? characterCount : `${value.length}/${maxLength}`}
        </span>
      )}
      {error && <span className="validation-error">{error}</span>}
    </div>
  );
};

export default InputField;
