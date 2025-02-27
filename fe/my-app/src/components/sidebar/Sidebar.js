import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <ul>
          <li>
            <NavLink exact to="/" activeClassName="active">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" activeClassName="active">
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/messages" activeClassName="active">
              Messages
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
    </aside>
  );
};

export default Sidebar;
