import React from 'react';
import './Avatar.css';

const Avatar = ({ src, alt, size = 40, className = '' }) => {
  return (
    <img
      className={`avatar ${className}`}
      src={src}
      alt={alt || "User Avatar"}
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: `${size / 2}px` }}
    />
  );
};

export default Avatar;
