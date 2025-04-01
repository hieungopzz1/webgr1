import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import api from '../../utils/api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

// Đăng ký các thành phần của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const socket = io("http://localhost:5001");

const StaffDashboard = () => {
  // Khởi tạo state cho các thống kê
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTutors: 0,
    totalClasses: 0,
    totalSchedules: 0,
    totalAssignedStudents: 0,
    totalUnassignedStudents: 0
  });

  // Hàm gọi API để lấy dữ liệu
  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard/admin');
      setStats(response.data);
    } catch (err) {
      console.error('Error for get data:', err);
    }
  };

  // UseEffect để gọi API và cập nhật dữ liệu khi có sự kiện
  useEffect(() => {
    fetchDashboardData();

    // 🔥 Khi có sự kiện 'updateDashboard', gọi lại API
    socket.on("updateDashboard", () => {
      fetchDashboardData();  // Gọi lại API để cập nhật dữ liệu
    });

    return () => {
      socket.off("updateDashboard");
    };

  }, []);

  // Dữ liệu cho Pie Chart
  const pieChartData = {
    labels: ['Sinh viên đã xếp lớp', 'Sinh viên chưa xếp lớp'],
    datasets: [
      {
        data: [stats.totalAssignedStudents, stats.totalUnassignedStudents],
        backgroundColor: ['#3498db', '#e74c3c'], // Màu sắc cho mỗi phần
        hoverBackgroundColor: ['#2980b9', '#c0392b'], // Màu hover
      }
    ]
  };

  // Dữ liệu cho Bar Chart (biểu đồ cột)
  const barChartData = {
    labels: ['Sinh viên'],
    datasets: [
      {
        label: 'Đã xếp lớp',
        data: [stats.totalAssignedStudents],
        backgroundColor: '#3498db',
      },
      {
        label: 'Chưa xếp lớp',
        data: [stats.totalUnassignedStudents],
        backgroundColor: '#e74c3c',
      }
    ]
  };

  // Cấu hình cho Pie Chart
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true
      }
    }
  };

  // Cấu hình cho Bar Chart
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Inline styles
  const containerStyle = {
    display: 'flex',
    gap: '20px',  // Khoảng cách giữa các biểu đồ
    justifyContent: 'space-between',
    marginTop: '20px',
  };

  const statBoxStyle = {
    backgroundColor: '#ecf0f1',
    borderRadius: '8px',
    padding: '20px',
    width: '23%',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',  // Đổ bóng cho box
    textAlign: 'center',
  };

  const statTextStyle = {
    fontSize: '18px',
    color: '#34495e',
    margin: '0',
  };

  const statStrongStyle = {
    fontWeight: 'bold',
    color: '#2c3e50',
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {/* Thông tin thống kê */}
      <div style={containerStyle}>
        <div style={statBoxStyle}>
          <p style={statTextStyle}><strong style={statStrongStyle}>Tổng số sinh viên:</strong> {stats.totalStudents}</p>
        </div>
        <div style={statBoxStyle}>
          <p style={statTextStyle}><strong style={statStrongStyle}>Tổng số giảng viên:</strong> {stats.totalTutors}</p>
        </div>
        <div style={statBoxStyle}>
          <p style={statTextStyle}><strong style={statStrongStyle}>Tổng số lớp học:</strong> {stats.totalClasses}</p>
        </div>
        <div style={statBoxStyle}>
          <p style={statTextStyle}><strong style={statStrongStyle}>Tổng số lịch học đã tạo:</strong> {stats.totalSchedules}</p>
        </div>
      </div>

      {/* Biểu đồ Pie và Bar trên cùng một hàng */}
      <div style={containerStyle}>
        <div style={{ width: '45%', margin: '10px', textAlign: 'center' }}>
          <h3>Biểu đồ phân bổ sinh viên đã xếp lớp và chưa xếp lớp (Pie Chart)</h3>
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
        <div style={{ width: '45%', margin: '10px', textAlign: 'center' }}>
          <h3>Biểu đồ cột số sinh viên đã xếp lớp và chưa xếp lớp</h3>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Hiển thị số liệu cho sinh viên đã xếp lớp và chưa xếp lớp */}
      <div>
        <p><strong>Tổng số sinh viên đã xếp lớp:</strong> {stats.totalAssignedStudents}</p>
        <p><strong>Tổng số sinh viên chưa xếp lớp:</strong> {stats.totalUnassignedStudents}</p>
      </div>
    </div>
  );
};

export default StaffDashboard;
