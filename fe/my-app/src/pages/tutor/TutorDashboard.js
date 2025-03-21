import React, { useState, useEffect } from 'react';
import DashboardCard from '../../components/dashboardcard/DashboardCard';
import Avatar from '../../components/avatar/Avatar';
import Notification from '../../components/notification/Notification';
import Pagination from '../../components/pagination/Pagination';
import Loader from '../../components/loader/Loader';
import Modal from '../../components/modal/Modal';
import './TutorDashboard.css';

const TutorDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        { id: 1, title: 'Math 101', students: 25 },
        { id: 2, title: 'English 201', students: 18 },
      ]);
      setNotifications([
        { id: 1, message: 'New message from a student', type: 'info' },
        { id: 2, message: 'Assignment deadline approaching', type: 'warning' },
      ]);
      setIsLoading(false);
      setTotalPages(2);
    }, 2000);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Add logic to fetch data for the selected page
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="tutor-dashboard">
      <div className="tutor-dashboard__header">
        <Avatar src="/avatar.png" alt="Tutor Avatar" size="large" />
        <h1>Welcome back, Tutor!</h1>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="tutor-dashboard__main-content">
          <div className="tutor-dashboard__cards">
            {courses.map((course) => (
              <DashboardCard
                key={course.id}
                title={course.title}
                content={`${course.students} students enrolled`}
                onClick={() => handleOpenModal()}
              />
            ))}
          </div>

          <div className="tutor-dashboard__notifications">
            {notifications.map((notification) => (
              <Notification key={notification.id} message={notification.message} type={notification.type} />
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Course Details">
        <p>Here you can see the details of the course.</p>
      </Modal>
    </div>
  );
};

export default TutorDashboard;
