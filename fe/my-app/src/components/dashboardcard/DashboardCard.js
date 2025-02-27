import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ title, value, icon }) => {
  return (
    <div className="dashboard-card">
      {icon && <div className="dashboard-card__icon">{icon}</div>}
      <div className="dashboard-card__content">
        <h3 className="dashboard-card__title">{title}</h3>
        <p className="dashboard-card__value">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
