import React from 'react';
import { Outlet } from 'react-router-dom';
import './StaffLayout.css';

const StaffLayout = () => {
  return (
    <div className="staff-layout">
      <Outlet />
    </div>
  );
};

export default StaffLayout;
