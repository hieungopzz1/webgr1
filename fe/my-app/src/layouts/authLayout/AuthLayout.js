import React from 'react';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <main className="auth-content">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
