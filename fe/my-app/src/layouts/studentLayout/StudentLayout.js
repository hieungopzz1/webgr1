import React from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/footer/Footer';
import './StudentLayout.css';

const StudentLayout = ({ children }) => {
  return (
    <div className="student-layout">
      <Header />
      <div className="student-layout__body">
        <Sidebar />
        <main className="student-layout__content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default StudentLayout;
