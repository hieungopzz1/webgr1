import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, NavLink, Link } from 'react-router-dom';

const Headertest = () => {
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Inline CSS for Header */}
      <style>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f2f2f2;
          padding: 15px 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header__left {
          display: flex;
          align-items: center;
        }
        .header__logo img {
          height: 50px;
        }
        .header__nav ul {
          list-style: none;
          display: flex;
          margin: 0;
          padding: 0;
        }
        .header__nav li {
          margin-left: 25px;
        }
        .header__nav li a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        .header__nav li a.active,
        .header__nav li a:hover {
          color: #007bff;
        }
        .header__right {
          display: flex;
          align-items: center;
        }
        .header__search {
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          margin-right: 20px;
        }
        .header__avatar {
          position: relative;
          cursor: pointer;
        }
        .header__avatar img {
          height: 45px;
          width: 45px;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .header__dropdown {
          position: absolute;
          top: 60px;
          right: 0;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 150px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }
        .header__dropdown ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .header__dropdown li {
          border-bottom: 1px solid #f0f0f0;
        }
        .header__dropdown li:last-child {
          border-bottom: none;
        }
        .header__dropdown li a {
          display: block;
          padding: 10px 15px;
          text-decoration: none;
          color: #333;
          transition: background 0.3s ease;
        }
        .header__dropdown li a:hover {
          background-color: #f2f2f2;
        }
      `}</style>

      <Router>
        <header className="header">
          <div className="header__left">
            <Link to="/" className="header__logo">
              <img src="/logo.png" alt="eTutoring Logo" />
            </Link>
            <nav className="header__nav">
              <ul>
                <li>
                  <NavLink exact to="/" activeClassName="active">
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/chat" activeClassName="active">
                    Chat
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/meetings" activeClassName="active">
                    Meetings
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/documents" activeClassName="active">
                    Documents
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/blogs" activeClassName="active">
                    Blog
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" activeClassName="active">
                    Settings
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
          <div className="header__right">
            <input
              type="text"
              className="header__search"
              placeholder="Search..."
            />
            <div className="header__avatar" ref={dropdownRef} onClick={toggleDropdown}>
              <img src="/avatar-generations_prsz.jpg" alt="User Avatar" />
              {dropdownOpen && (
                <div className="header__dropdown">
                  <ul>
                    <li>
                      <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                      <Link to="/notifications">Notifications</Link>
                    </li>
                    <li>
                      <Link to="/logout">Logout</Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>
      </Router>
    </>
  );
};

export default Headertest;
