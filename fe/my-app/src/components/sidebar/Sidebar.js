import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { ROUTES, USER_ROLES } from "../../utils/constants";
import useAuth from "../../hooks/useAuth";
import "./Sidebar.css";

const MENU_ITEMS = {
  common: [
    {
      to: ROUTES.HOME,
      icon: <i className="bi bi-house-heart" />,
      activeIcon: <i className="bi bi-house-heart-fill" />,
      label: "Home",
      end: true,
    },
    {
      icon: <i className="bi bi-file-earmark-plus" />,
      activeIcon: <i className="bi bi-file-earmark-plus-fill" />,
      label: "Create Post",
      onClick: () =>
        window.dispatchEvent(new CustomEvent("openCreateBlogModal")),
    },
    {
      to: "/search",
      icon: <i className="bi bi-search-heart" />,
      activeIcon: <i className="bi bi-search-heart-fill" />,
      label: "Search",
    },
    {
      to: ROUTES.MESSAGES,
      icon: <i className="bi bi-chat-dots" />,
      activeIcon: <i className="bi bi-chat-dots-fill" />,
      label: "Messages",
    },
    {
      to: "/notifications",
      icon: <i className="bi bi-bell" />,
      activeIcon: <i className="bi bi-bell-fill" />,
      label: "Notifications",
    },
    {
      type: "dynamic",
      icon: <i className="bi bi-calendar2-event" />,
      activeIcon: <i className="bi bi-calendar2-event-fill" />,
      label: "Timetable",
      getTo: (role) => role === USER_ROLES.ADMIN ? "/timetable" : "/user-timetable",
    },
    // {
    //   to: ROUTES.DASHBOARD,
    //   icon: <i className="bi bi-bar-chart" />,
    //   activeIcon: <i className="bi bi-bar-chart-fill" />,
    //   label: "Dashboard",
    // },
  ],
  [USER_ROLES.ADMIN]: [
    {
      to: ROUTES.REGISTER,
      icon: <i className="bi bi-person-plus" />,
      activeIcon: <i className="bi bi-person-plus-fill" />,
      label: "Create Account",
    },
    {
      to: "/assign-tutor",
      icon: <i className="bi bi-people" />,
      activeIcon: <i className="bi bi-people-fill" />,
      label: "Class Assignment",
    },
  ],
  [USER_ROLES.TUTOR]: [],
  [USER_ROLES.STUDENT]: [],
};

const BOTTOM_MENU = {
  settings: {
    to: ROUTES.SETTINGS,
    icon: <i className="bi bi-gear" />,
    activeIcon: <i className="bi bi-gear-fill" />,
    label: "Settings",
    end: true,
  },
};

const NavItem = ({ item }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuth();
  const userRole = user?.role || USER_ROLES.STUDENT;

  if (item.type === "dropdown") {
    return (
      <li className="dropdown-container">
        <button
          className={`nav-link ${isDropdownOpen ? "active" : ""}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="nav-icon-wrapper">
            <span className="icon-normal">{item.icon}</span>
            <span className="icon-active">{item.activeIcon}</span>
          </div>
          <span className="nav-label">{item.label}</span>
        </button>
        {isDropdownOpen && (
          <div
            className="dropdown-overlay"
            onClick={() => setIsDropdownOpen(false)}
          >
            <ul className="dropdown-menu">
              {item.items.map((dropdownItem, index) => (
                <li key={index}>
                  {dropdownItem.onClick ? (
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        dropdownItem.onClick();
                        setIsDropdownOpen(false);
                      }}
                    >
                      {dropdownItem.icon}
                      <span>{dropdownItem.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      to={dropdownItem.to}
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {dropdownItem.icon}
                      <span>{dropdownItem.label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  if (item.type === "dynamic") {
    const linkTo = item.getTo(userRole);
    return (
      <li>
        <NavLink
          to={linkTo}
          end={item.end}
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <div className="nav-icon-wrapper">
            <span className="icon-normal">{item.icon}</span>
            <span className="icon-active">{item.activeIcon}</span>
          </div>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      </li>
    );
  }

  if (item.onClick) {
    return (
      <li>
        <button className="nav-link" onClick={item.onClick}>
          <div className="nav-icon-wrapper">
            <span className="icon-normal">{item.icon}</span>
            <span className="icon-active">{item.activeIcon}</span>
          </div>
          <span className="nav-label">{item.label}</span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      >
        <div className="nav-icon-wrapper">
          <span className="icon-normal">{item.icon}</span>
          <span className="icon-active">{item.activeIcon}</span>
        </div>
        <span className="nav-label">{item.label}</span>
      </NavLink>
    </li>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const userRole = user?.role || USER_ROLES.STUDENT;
  const location = useLocation();
  const { expanded } = useSidebar();
  const isMessagesPage = location.pathname.startsWith("/messages");

  const roleSpecificItems = MENU_ITEMS[userRole] || [];
  const dashboardItem = {
    to: ROUTES.DASHBOARD(userRole), // 🛠 Lấy Dashboard theo role
    icon: <i className="bi bi-bar-chart" />,
    activeIcon: <i className="bi bi-bar-chart-fill" />,
    label: "Dashboard",
  };

  const menuItems = [...MENU_ITEMS.common, dashboardItem, ...roleSpecificItems];

  return (
    <aside
      className={`sidebar ${isMessagesPage || !expanded ? "collapsed" : ""}`}
    >
      <div className="sidebar__logo">
        <NavLink to={ROUTES.HOME} className="logo-link">
          <img src="/logo192.png" alt="eTutoring Logo" />
        </NavLink>
      </div>
      <nav className="sidebar__nav">
        <ul className="sidebar__main-menu">
          {menuItems.map((item, index) => (
            <NavItem key={index} item={item} />
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
