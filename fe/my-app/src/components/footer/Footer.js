import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__links">
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact Support</a>
        </div>
        <div className="footer__copyright">
          © {new Date().getFullYear()} eTutoring. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
