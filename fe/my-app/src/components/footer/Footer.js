import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const links = [
    { text: 'Terms of Service', url: '/terms' },
    { text: 'Privacy Policy', url: '/privacy' },
    { text: 'About Us', url: '/about' },
    { text: 'Contact Support', url: '/contact' },
    { text: 'API', url: '/api' },
    { text: 'Jobs', url: '/jobs' },
    { text: 'Language', url: '#' }
  ];

  return (
    <footer className="footer">
      <div className="footer__container">
        <nav className="footer__nav">
          {links.map((link, index) => (
            <React.Fragment key={index}>
              {link.url.startsWith('http') ? (
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.text}
                </a>
              ) : (
                <Link to={link.url}>{link.text}</Link>
              )}
              {index < links.length - 1 && <span className="footer__dot">·</span>}
            </React.Fragment>
          ))}
        </nav>
        <div className="footer__copyright">
          © {new Date().getFullYear()} eTutoring from Meta
        </div>
      </div>
    </footer>
  );
};

export default Footer;
