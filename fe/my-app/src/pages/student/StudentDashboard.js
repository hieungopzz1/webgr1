import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../utils/api';
import './StudentDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/dashboard/student');
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="student-dashboard">
        <div className="no-data-message">
          <h3>No Data Available</h3>
          <p>There is currently no dashboard data to display.</p>
        </div>
      </div>
    );
  }

  const activityChartData = {
    labels: ['Blogs', 'Comments', 'Likes', 'Messages'],
    datasets: [
      {
        label: 'Activity Count',
        data: [
          dashboardData.totalBlogs || 0,
          dashboardData.totalComments || 0,
          dashboardData.totalLikes || 0,
          dashboardData.recentMessages || 0
        ],
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',  // Green for blogs
          'rgba(33, 150, 243, 0.7)',  // Blue for comments
          'rgba(255, 87, 34, 0.7)',   // Deep Orange for likes
          'rgba(156, 39, 176, 0.7)'   // Purple for messages
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(255, 87, 34, 1)',
          'rgba(156, 39, 176, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const absenceData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [
          Math.max(0, (dashboardData.classes || 0) * 2 - (dashboardData.totalAbsentDays || 0)),
          dashboardData.totalAbsentDays || 0
        ],
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',  
          'rgba(244, 67, 54, 0.7)'   
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Student Activity Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Attendance Record'
      }
    }
  };

  return (
    <div className="student-dashboard">
      <h1 className="student-dashboard-title">Student Dashboard</h1>
      
      <div className="student-stats-container">
        <div className="student-stat-box">
          <div className="student-stat-icon blogs">
            <i className="bi bi-file-earmark-text"></i>
          </div>
          <h3 className="student-stat-title">Blogs</h3>
          <div className="student-stat-value">{dashboardData.totalBlogs || 0}</div>
        </div>
        
        <div className="student-stat-box">
          <div className="student-stat-icon messages">
            <i className="bi bi-chat-dots"></i>
          </div>
          <h3 className="student-stat-title">Recent Messages</h3>
          <div className="student-stat-value">{dashboardData.recentMessages || 0}</div>
        </div>
        
        <div className="student-stat-box">
          <div className="student-stat-icon absences">
            <i className="bi bi-calendar-x"></i>
          </div>
          <h3 className="student-stat-title">Absent Days</h3>
          <div className="student-stat-value">{dashboardData.totalAbsentDays || 0}</div>
        </div>
        
        <div className="student-stat-box">
          <div className="student-stat-icon documents">
            <i className="bi bi-journals"></i>
          </div>
          <h3 className="student-stat-title">Classes</h3>
          <div className="student-stat-value">{dashboardData.classes || 0}</div>
        </div>
      </div>

      <div className="student-charts-container">
        <div className="student-chart-box">
          <h3 className="student-chart-title">Activity Overview</h3>
          <div style={{ height: '300px' }}>
            <Bar data={activityChartData} options={barOptions} />
          </div>
        </div>
        
        <div className="student-chart-box">
          <h3 className="student-chart-title">Attendance Record</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={absenceData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
