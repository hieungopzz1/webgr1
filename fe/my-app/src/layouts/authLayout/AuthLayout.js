import React from 'react';
import Footer from '../../components/footer/Footer';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <main className="auth-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
