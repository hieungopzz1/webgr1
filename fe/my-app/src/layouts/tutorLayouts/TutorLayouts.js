import React from 'react';
import { Outlet } from 'react-router-dom';
import './TutorLayout.css';

const TutorLayout = () => {
  return (
    <div className="tutor-layout">
      <Outlet />
    </div>
  );
};

export default TutorLayout;
