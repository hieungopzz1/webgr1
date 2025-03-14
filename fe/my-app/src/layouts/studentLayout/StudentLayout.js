import React from 'react';
import { Outlet } from 'react-router-dom';
import './StudentLayout.css';

const StudentLayout = () => {
  return (
    <div className="student-layout">
      <Outlet />
    </div>
  );
};

export default StudentLayout;
