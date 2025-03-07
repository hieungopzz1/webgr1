import React from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import Footer from '../../components/footer/Footer';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <div className="main-layout__content">
        <Sidebar />
        <main className="main-content">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 