import React, { useState } from 'react';
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
      to: '/search',
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

const NavItem = ({ item }) => (
  <li>
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    >
      <div className="nav-icon-wrapper">
        <span className="icon-normal">{item.icon}</span>
        <span className="icon-active">{item.activeIcon}</span>
      </div>
      <span className="nav-label">{item.label}</span>
    </NavLink>
  </li>
);

const Sidebar = () => {
  const [userRole] = useState('student');
  const menuItems = [...MENU_ITEMS.common, ...MENU_ITEMS[userRole]];

  return (
    <aside className="sidebar">
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
            />
          ))}
        </ul>
        <ul className="sidebar__bottom-menu">
          <NavItem item={BOTTOM_MENU.settings} />
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
