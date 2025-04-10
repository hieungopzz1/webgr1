import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import api from '../../utils/api';
import './StaffDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const StaffDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/dashboard/admin');
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
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
      <div className="admin-dashboard">
        <div className="no-data-message">
          <h3>No Data Available</h3>
          <p>There is currently no dashboard data to display.</p>
        </div>
      </div>
    );
  }

  const classAssignmentData = {
    labels: ['Assigned Classes', 'Unassigned Classes'],
    datasets: [
      {
        data: [
          dashboardData.totalClassAssign || 0,
          dashboardData.totalClassUnassign || 0
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#2693DB', '#FF4D74'],
        borderWidth: 1
      }
    ]
  };

  const studentInteractionData = {
    labels: ['Active Students', 'Inactive Students'],
    datasets: [
      {
        data: [
          dashboardData.activeStudents7Days || 0,
          dashboardData.studentsNoInteraction7Days || 0
        ],
        backgroundColor: ['#4BC0C0', '#FF9F40'],
        hoverBackgroundColor: ['#3CB0B0', '#FF8F30'],
        borderWidth: 1
      }
    ]
  };

  const documentData = {
    labels: ['Students with Uploads', 'Students without Uploads'],
    datasets: [
      {
        data: [
          (dashboardData.totalStudents - dashboardData.studentsWithoutDocuments) || 0,
          dashboardData.studentsWithoutDocuments || 0
        ],
        backgroundColor: ['#9966FF', '#FFCD56'],
        hoverBackgroundColor: ['#8A56FF', '#FFBD46'],
        borderWidth: 1
      }
    ]
  };

  const messagesData = {
    labels: ['Messages in Last 7 Days'],
    datasets: [
      {
        label: 'Total Messages',
        data: [dashboardData.messages || 0],
        backgroundColor: ['#36A2EB'],
        borderWidth: 1
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
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
      
      <div className="stats-container">
        <div className="stat-box">
          <h3 className="stat-title">Total Students</h3>
          <div className="stat-value">{dashboardData.totalStudents || 0}</div>
        </div>
        <div className="stat-box">
          <h3 className="stat-title">Total Tutors</h3>
          <div className="stat-value">{dashboardData.totalTutors || 0}</div>
        </div>
        <div className="stat-box">
          <h3 className="stat-title">Total Classes</h3>
          <div className="stat-value">{dashboardData.totalClasses || 0}</div>
        </div>
        <div className="stat-box">
          <h3 className="stat-title">Total Schedules</h3>
          <div className="stat-value">{dashboardData.totalSchedules || 0}</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-box">
          <h3 className="chart-title">Class Assignment Distribution</h3>
          <div style={{ height: '300px' }}>
            <Pie data={classAssignmentData} options={pieOptions} />
          </div>
        </div>
        <div className="chart-box">
          <h3 className="chart-title">Student Interaction (Last 7 Days)</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={studentInteractionData} options={pieOptions} />
          </div>
        </div>
        <div className="chart-box">
          <h3 className="chart-title">Document Upload Status</h3>
          <div style={{ height: '300px' }}>
            <Pie data={documentData} options={pieOptions} />
          </div>
        </div>
        <div className="chart-box">
          <h3 className="chart-title">Message Activity</h3>
          <div style={{ height: '300px' }}>
            <Bar data={messagesData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="stats-container">
        <div className="stat-box">
          <h3 className="stat-title">Assigned Students</h3>
          <div className="stat-value">{dashboardData.totalAssignedStudents || 0}</div>
        </div>
        <div className="stat-box">
          <h3 className="stat-title">Unassigned Students</h3>
          <div className="stat-value">{dashboardData.totalUnassignedStudents || 0}</div>
        </div>
        <div className="stat-box">
          <h3 className="stat-title">Present Count</h3>
          <div className="stat-value">{dashboardData.presentCount || 0}</div>
        </div>
        <div className="stat-box">
          <h3 className="stat-title">Absent Count</h3>
          <div className="stat-value">{dashboardData.absentCount || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
