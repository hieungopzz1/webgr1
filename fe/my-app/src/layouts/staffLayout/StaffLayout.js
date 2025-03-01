import React from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/side/Sidebar';
import Footer from '../components/footer/Footer';
import './StaffLayout.css';

const StaffLayout = ({ children }) => {
  return (
    <div className="staff-layout">
      <Header />
      <div className="staff-layout__body">
        <Sidebar />
        <main className="staff-layout__content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default StaffLayout;
