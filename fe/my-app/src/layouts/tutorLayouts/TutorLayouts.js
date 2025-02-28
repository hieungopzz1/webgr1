import React from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import Footer from '../components/footer/Footer';
import './TutorLayout.css';

const TutorLayout = ({ children }) => {
  return (
    <div className="tutor-layout">
      <Header />
      <div className="tutor-layout__body">
        <Sidebar />
        <main className="tutor-layout__content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TutorLayout;
