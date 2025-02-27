import React from 'react';
import './Breadcrumb.css';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="breadcrumb">
      {items.map((item, index) => (
        <span key={index} className="breadcrumb__item">
          {item.to ? (
            <Link to={item.to} className="breadcrumb__link">
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb__text">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="breadcrumb__separator">&gt;</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
