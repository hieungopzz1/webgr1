import React, { useState } from 'react';
import DashboardCard from '../components/dashboardcard/DashboardCard';
import Button from '../components/button/Button';
import InputField from '../components/inputField/InputField';
import Modal from '../components/modal/Modal';
import Pagination from '../components/pagination/Pagination';
import Avatar from '../components/avatar/Avatar';
import Notification from '../components/notification/Notification';
import Breadcrumb from '../components/breadcrumb/Breadcrumb';
import Loader from '../components/loader/Loader';
import './Landing.css';

const Landing = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleModal = () => setModalOpen(prev => !prev);

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Landing' }
  ];

  return (
    <div className="landing">
      <h1>Component Demo Landing Page</h1>

      {/* Dashboard Cards Demo */}
      <section className="section">
        <h2>Dashboard Cards</h2>
        <div className="dashboard-cards">
          <DashboardCard 
            title="Total Users" 
            value="123" 
            icon={<span role="img" aria-label="users">👥</span>} 
          />
          <DashboardCard 
            title="Active Sessions" 
            value="45" 
            icon={<span role="img" aria-label="sessions">💻</span>} 
          />
          <DashboardCard 
            title="Upcoming Meetings" 
            value="10" 
            icon={<span role="img" aria-label="meetings">📅</span>} 
          />
        </div>
      </section>
      
      {/* Button Demo */}
      <section className="section">
        <h2>Button</h2>
        <Button onClick={() => alert("Button Fucked!")}>
          Fuck Me
        </Button>
      </section>

      {/* InputField Demo */}
      <section className="section">
        <h2>Input Field</h2>
        <InputField 
          label="Enter your email" 
          name="email" 
          placeholder="Email..." 
          value=""
          onChange={() => {}}
        />
      </section>
      
      {/* Modal Demo */}
      <section className="section">
        <h2>Modal</h2>
        <Button onClick={toggleModal}>Open Modal Demo</Button>
        <Modal isOpen={isModalOpen} onClose={toggleModal} title="Modal Demo">
          <p>This is a demo modal to showcase the Modal component.</p>
          <Button onClick={toggleModal}>Close Modal</Button>
        </Modal>
      </section>
      
      {/* Pagination Demo */}
      <section className="section">
        <h2>Pagination</h2>
        <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
      </section>
      
      {/* Avatar Demo */}
      <section className="section">
        <h2>Avatar</h2>
        <Avatar src="/avatar-generations_prsz.jpg" alt="User Avatar" size={80} />
      </section>
      
      {/* Notification Demo */}
      <section className="section">
        <h2>Notification</h2>
        <Notification message="This is an info notification" type="info" />
        <Notification message="This is a success notification" type="success" />
        <Notification message="This is an error notification" type="error" />
      </section>
      
      {/* Breadcrumb Demo */}
      <section className="section">
        <h2>Breadcrumb</h2>
        <Breadcrumb items={breadcrumbItems} />
      </section>
      
      {/* Loader Demo */}
      <section className="section">
        <h2>Loader</h2>
        <Loader />
      </section>
    </div>
  );
};

export default Landing;
