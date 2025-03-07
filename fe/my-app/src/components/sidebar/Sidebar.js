import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const MENU_ITEMS = {
  common: [
    {
      to: '/',
      icon: <i className="bi bi-house-heart" />,
      activeIcon: <i className="bi bi-house-heart-fill" />,
      label: 'Home',
      end: true
    },
    {
      type: 'button',
      icon: <i className="bi bi-search-heart" />,
      activeIcon: <i className="bi bi-search-heart-fill" />,
      label: 'Search'
    },
    {
      to: '/messages',
      icon: <i className="bi bi-chat-dots" />,
      activeIcon: <i className="bi bi-chat-dots-fill" />,
      label: 'Messages'
    },
    {
      to: '/notifications',
      icon: <i className="bi bi-bell" />,
      activeIcon: <i className="bi bi-bell-fill" />,
      label: 'Notifications'
    },
    {
      to: '/timetable',
      icon: <i className="bi bi-calendar2-event" />,
      activeIcon: <i className="bi bi-calendar2-event-fill" />,
      label: 'Timetable'
    },
    {
      to: '/dashboard',
      icon: <i className="bi bi-bar-chart" />,
      activeIcon: <i className="bi bi-bar-chart-fill" />,
      label: 'Dashboard'
    }
  ],
  admin: [
    {
      to: '/register',
      icon: <i className="bi bi-person-plus" />,
      activeIcon: <i className="bi bi-person-plus" />,
      label: 'Create Account'
    },
    {
      to: '/assign-tutor',
      icon: <i className="bi bi-people" />,
      activeIcon: <i className="bi bi-people-fill" />,
      label: 'Tutor Assignment'
    }
  ],
  tutor: [],
  student: []
};

const BOTTOM_MENU = {
  settings: {
    to: '/settings',
    icon: <i className="bi bi-gear" />,
    activeIcon: <i className="bi bi-gear-fill" />,
    label: 'Settings',
    end: true
  }
};

const NavItem = ({ item, isActive, onClick }) => (
  <li>
    {item.type === 'button' ? (
      <button className={`nav-button ${isActive ? 'active' : ''}`} onClick={onClick}>
        <div className="nav-icon-wrapper">
          <span className="icon-normal">{item.icon}</span>
          <span className="icon-active">{item.activeIcon}</span>
        </div>
        <span className="nav-label">{item.label}</span>
      </button>
    ) : (
      <NavLink
        to={item.to}
        {...(item.end ? { end: true } : {})}
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <div className="nav-icon-wrapper">
          <span className="icon-normal">{item.icon}</span>
          <span className="icon-active">{item.activeIcon}</span>
        </div>
        <span className="nav-label">{item.label}</span>
      </NavLink>
    )}
  </li>
);

const SearchPanel = ({ onClose, searchPanelRef }) => (
  <div className="search-panel" ref={searchPanelRef}>
    <div className="search-panel__header">
      <h2>Search</h2>
      <button className="search-panel__close" onClick={onClose}>
        <i className="bi bi-x-lg" />
      </button>
    </div>
    <div className="search-panel__input">
      <i className="bi bi-search-heart-fill" />
      <input type="text" placeholder="Search" />
    </div>
    <div className="search-panel__content">
      <div className="search-panel__recent">
        <div className="search-panel__title">
          <span>Recent</span>
          <button>Clear all</button>
        </div>
      </div>
    </div>
  </div>
);

const Sidebar = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchPanelRef = useRef(null);
  const [userRole] = useState('student');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(event.target)) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [...MENU_ITEMS.common, ...MENU_ITEMS[userRole]];

  return (
    <aside className={`sidebar ${isSearchActive ? 'search-active' : ''}`}>
      <div className="sidebar__logo">
        <NavLink to="/" className="logo-link">
          <img src="/logo.png" alt="eTutoring Logo" />
        </NavLink>
      </div>
      <nav className="sidebar__nav">
        <ul className="sidebar__main-menu">
          {menuItems.map((item, index) => (
            <NavItem
              key={index}
              item={item}
              isActive={isSearchActive && item.label === 'Search'}
              onClick={() => item.label === 'Search' && setIsSearchActive(true)}
            />
          ))}
        </ul>
        <ul className="sidebar__bottom-menu">
          <NavItem item={BOTTOM_MENU.settings} />
        </ul>
      </nav>
      {isSearchActive && (
        <SearchPanel
          onClose={() => setIsSearchActive(false)}
          searchPanelRef={searchPanelRef}
        />
      )}
    </aside>
  );
};

export default Sidebar;
