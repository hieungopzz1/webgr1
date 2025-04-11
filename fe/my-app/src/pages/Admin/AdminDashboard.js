import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import axios from 'axios';
import './AdminDashboard.css';
import { FaUsers, FaChalkboardTeacher, FaCalendarAlt, FaBookOpen } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/dashboard/admin');
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="retry-button" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="no-data-message">
        <h3>No Data Available</h3>
        <p>There is no dashboard data available at this time.</p>
        <button className="retry-button" onClick={fetchDashboardData}>
          Refresh
        </button>
      </div>
    );
  }

  // User statistics data
  const userStatistics = {
    labels: ['Students', 'Tutors', 'Admins'],
    datasets: [
      {
        label: 'User Count',
        data: [
          dashboardData.totalStudents || 0,
          dashboardData.totalTutors || 0,
          dashboardData.totalAdmins || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // System activity data
  const systemActivity = {
    labels: ['Classes', 'Documents', 'Blogs', 'Messages'],
    datasets: [
      {
        label: 'Count',
        data: [
          dashboardData.totalClasses || 0,
          dashboardData.totalDocuments || 0,
          dashboardData.totalBlogs || 0,
          dashboardData.totalMessages || 0
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  // Monthly registrations data
  const monthlyData = {
    labels: dashboardData.monthlyRegistrations?.map(item => item.month) || [],
    datasets: [
      {
        label: 'New Users',
        data: dashboardData.monthlyRegistrations?.map(item => item.count) || [],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.4
      }
    ]
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'System Activity Overview'
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
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Distribution'
      }
    }
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly User Registrations'
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

  return (
    <div className="admin-dashboard">
      <h1 className="admin-dashboard-title">Admin Dashboard</h1>

      <div className="admin-stats-container">
        <div className="admin-stat-box">
          <div className="admin-stat-icon students">
            <FaUsers />
          </div>
          <h3 className="admin-stat-title">Total Students</h3>
          <p className="admin-stat-value">{dashboardData.totalStudents || 0}</p>
        </div>

        <div className="admin-stat-box">
          <div className="admin-stat-icon tutors">
            <FaChalkboardTeacher />
          </div>
          <h3 className="admin-stat-title">Total Tutors</h3>
          <p className="admin-stat-value">{dashboardData.totalTutors || 0}</p>
        </div>

        <div className="admin-stat-box">
          <div className="admin-stat-icon classes">
            <FaCalendarAlt />
          </div>
          <h3 className="admin-stat-title">Active Classes</h3>
          <p className="admin-stat-value">{dashboardData.activeClasses || 0}</p>
        </div>

        <div className="admin-stat-box">
          <div className="admin-stat-icon content">
            <FaBookOpen />
          </div>
          <h3 className="admin-stat-title">Total Content</h3>
          <p className="admin-stat-value">
            {(dashboardData.totalDocuments || 0) + (dashboardData.totalBlogs || 0)}
          </p>
        </div>
      </div>

      <div className="admin-charts-container">
        <div className="admin-chart-box">
          <h3 className="admin-chart-title">User Distribution</h3>
          <Doughnut data={userStatistics} options={doughnutOptions} />
        </div>

        <div className="admin-chart-box">
          <h3 className="admin-chart-title">System Activity</h3>
          <Bar data={systemActivity} options={barOptions} />
        </div>

        <div className="admin-chart-full-width">
          <h3 className="admin-chart-title">Monthly User Registrations</h3>
          <Line data={monthlyData} options={lineOptions} />
        </div>
      </div>

      <div className="admin-recent-activity">
        <h3 className="admin-section-title">Recent System Activity</h3>
        {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
          <div className="admin-activity-list">
            {dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="admin-activity-item">
                <div className="admin-activity-time">{new Date(activity.timestamp).toLocaleString()}</div>
                <div className="admin-activity-type">{activity.type}</div>
                <div className="admin-activity-description">{activity.description}</div>
                <div className="admin-activity-user">{activity.user}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-activities">No recent activities to display</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 