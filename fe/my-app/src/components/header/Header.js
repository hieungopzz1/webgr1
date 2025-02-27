import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <Link to="/" className="header__logo">
            <img src="/logo.png" alt="eTutoring Logo" />
          </Link>
          <nav className="header__nav">
            <NavLink exact to="/" activeClassName="active">Dashboard</NavLink>
            <NavLink to="/chat" activeClassName="active">Chat</NavLink>
            <NavLink to="/meetings" activeClassName="active">Meetings</NavLink>
            <NavLink to="/documents" activeClassName="active">Documents</NavLink>
            <NavLink to="/blogs" activeClassName="active">Blog</NavLink>
            <NavLink to="/settings" activeClassName="active">Settings</NavLink>
          </nav>
        </div>
        <div className="header__right">
          <input 
            type="text" 
            className="header__search" 
            placeholder="Search..." 
          />
          <div className="header__avatar" ref={dropdownRef}>
            <img 
              src="/avatar-generations_prsz.jpg" 
              alt="User Avatar" 
              onClick={toggleDropdown} 
            />
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
      </div>
    </header>
  );
};

export default Header;
