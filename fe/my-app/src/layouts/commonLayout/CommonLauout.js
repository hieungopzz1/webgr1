import React from 'react';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import './CommonLayout.css';

const CommonLayout = ({ children }) => {
  return (
    <div className="common-layout">
      <Header />
      <main className="common-layout__content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default CommonLayout;
