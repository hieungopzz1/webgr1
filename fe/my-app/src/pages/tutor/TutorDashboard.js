import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/avatar/Avatar';
import Button from '../../components/button/Button';
import DashboardCard from '../../components/dashboardcard/DashboardCard';
import Notification from '../../components/notification/Notification';
import Sidebar from '../../components/sidebar/Sidebar';

import useTutorDashboard from '../../hooks/useTutorDashboard'; // Sử dụng custom hook

const TutorDashboard = () => {
  const { students, upcomingMeetings, report, messages, announcement } = useTutorDashboard();

  return (
    <div className="tutor-dashboard">
      <Sidebar />

      <div className="main-content">
        <h1>Tutor Dashboard</h1>

        {/* List of Students */}
        <div className="students">
          <DashboardCard title="List of Students">
            {students.map((student, index) => (
              <div key={index} className="student-item">
                <Avatar name={student.name} status={student.status} />
                <span>{student.status}</span>
              </div>
            ))}
          </DashboardCard>
        </div>

        {/* Upcoming Meetings */}
        <div className="upcoming-meetings">
          <DashboardCard title="Upcoming Meetings">
            {upcomingMeetings.map((meeting, index) => (
              <div key={index} className="meeting">
                <p>{meeting.description}</p>
                <p>Date: {meeting.date}</p>
                <Button label="Join" />
              </div>
            ))}
          </DashboardCard>
        </div>

        {/* New Messages */}
        <div className="new-messages">
          <DashboardCard title="New Messages">
            {messages.map((message, index) => (
              <Notification key={index} message={message} />
            ))}
          </DashboardCard>
        </div>

        {/* Report & Interact */}
        <div className="report-interact">
          <DashboardCard title="Report & Interact">
            <p>Messages: {report.messages}</p>
            <p>Number of joined meetings: {report.joinedMeetings}</p>
            <p>Interact rate: {report.interactRate}%</p>
          </DashboardCard>
        </div>

        {/* Important Announcement */}
        <div className="important-announcement">
          <DashboardCard title="Important Announcement">
            <p>{announcement}</p>
          </DashboardCard>
        </div>

        {/* Link to Student Progress page */}
        <div className="student-progress-link">
          <Link to="/student-progress">View Student Progress</Link>
        </div>

        {/* Thêm liên kết tới trang Manage Courses */}
        <div className="manage-courses-link">
          <Link to="/manage-courses">Manage Courses</Link>
        </div>

        {/* Thêm liên kết tới trang Assignment Review */}
        <div className="assignment-review-link">
          <Link to="/assignment-review">View Assignments</Link>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
