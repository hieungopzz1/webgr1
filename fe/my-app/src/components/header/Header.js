import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="header">
      <div className="header__left">
        <Link to="/" className="header__logo">
          <img src="/logo.png" alt="eTutoring Logo" />
        </Link>
        <nav className="header__nav">
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/chat">Chat</Link></li>
            <li><Link to="/meetings">Meetings</Link></li>
            <li><Link to="/documents">Documents</Link></li>
            <li><Link to="/blogs">Blog</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>
      </div>
      <div className="header__right">
        <div className="header__search">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="header__avatar" ref={dropdownRef}>
          <img src="/avatar.png" alt="User Avatar" onClick={toggleDropdown} />
          {dropdownOpen && (
            <div className="header__dropdown">
              <ul>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/notifications">Notifications</Link></li>
                <li><Link to="/logout">Logout</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
