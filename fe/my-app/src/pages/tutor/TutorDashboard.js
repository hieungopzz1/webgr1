import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../utils/api';
import './TutorDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const TutorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/dashboard/tutor');
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tutor dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="tutor-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-dashboard">
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
      <div className="tutor-dashboard">
        <div className="no-data-message">
          <h3>No Data Available</h3>
          <p>There is currently no dashboard data to display.</p>
        </div>
      </div>
    );
  }

  const summaryChartData = {
    labels: ['Blogs', 'Documents', 'Messages', 'Comments'],
    datasets: [
      {
        label: 'Tutor Activity',
        data: [
          dashboardData.totalBlogs || 0,
          dashboardData.totalDocuments || 0,
          dashboardData.recentMessages || 0,
          dashboardData.totalComments || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const interactionData = {
    labels: ['Blogs', 'Comments', 'Likes', 'Messages'],
    datasets: [
      {
        label: 'Count',
        data: [
          dashboardData.totalBlogs || 0,
          dashboardData.totalComments || 0,
          dashboardData.totalLikes || 0,
          dashboardData.recentMessages || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)'
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
        text: 'Activity Overview'
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
        text: 'Interaction Distribution'
      }
    }
  };

  return (
    <div className="tutor-dashboard">
      <h1 className="tutor-dashboard-title">Tutor Dashboard</h1>
      
      <div className="tutor-stats-container">
        <div className="tutor-stat-box">
          <div className="tutor-stat-icon">
            <i className="bi bi-file-earmark-text"></i>
          </div>
          <h3 className="tutor-stat-title">Total Blogs</h3>
          <div className="tutor-stat-value">{dashboardData.totalBlogs || 0}</div>
        </div>
        
        <div className="tutor-stat-box">
          <div className="tutor-stat-icon">
            <i className="bi bi-file-earmark-arrow-up"></i>
          </div>
          <h3 className="tutor-stat-title">Documents</h3>
          <div className="tutor-stat-value">{dashboardData.totalDocuments || 0}</div>
        </div>
        
        <div className="tutor-stat-box">
          <div className="tutor-stat-icon">
            <i className="bi bi-chat-dots"></i>
          </div>
          <h3 className="tutor-stat-title">Recent Messages</h3>
          <div className="tutor-stat-value">{dashboardData.recentMessages || 0}</div>
        </div>
        
        <div className="tutor-stat-box">
          <div className="tutor-stat-icon">
            <i className="bi bi-hand-thumbs-up"></i>
          </div>
          <h3 className="tutor-stat-title">Likes</h3>
          <div className="tutor-stat-value">{dashboardData.totalLikes || 0}</div>
        </div>
        
        {dashboardData.totalClasses !== undefined && (
          <div className="tutor-stat-box">
            <div className="tutor-stat-icon">
              <i className="bi bi-people"></i>
            </div>
            <h3 className="tutor-stat-title">Classes</h3>
            <div className="tutor-stat-value">{dashboardData.totalClasses || 0}</div>
          </div>
        )}
      </div>

      <div className="tutor-charts-container">
        <div className="tutor-chart-box">
          <h3 className="tutor-chart-title">Activity Overview</h3>
          <div style={{ height: '300px' }}>
            <Bar data={summaryChartData} options={barOptions} />
          </div>
        </div>
        
        <div className="tutor-chart-box">
          <h3 className="tutor-chart-title">Interaction Distribution</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={interactionData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
