import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import api from '../../utils/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const socket = io("http://localhost:5001");

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTutors: 0,
    totalClasses: 0,
    totalSchedules: 0,
    presentCount: 0,
    absentCount: 0,
    totalUnassignedStudents: 0,
    totalAssignedStudents: 0,
    totalUnassignedTutors: 0,
    totalAssignedTutors: 0,
    totalClassAssigned: 0,
    totalClassUnassigned: 0,
    // other stats ...
  });

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard/admin');
      setStats(response.data);
    } catch (err) {
      console.error('Error for get data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    socket.on("updateDashboard", () => {
      fetchDashboardData();
    });

    return () => {
      socket.off("updateDashboard");
    };

  }, []);

  // Biểu đồ Pie cho sinh viên
  const studentPieData = {
    labels: ['Sinh viên đã có lớp', 'Sinh viên chưa có lớp'],
    datasets: [
      {
        label: 'Số sinh viên',
        data: [stats.totalAssignedStudents, stats.totalUnassignedStudents],
        backgroundColor: ['#4caf50', '#ff9800'],
        borderColor: ['#4caf50', '#ff9800'],
        borderWidth: 1,
      },
    ],
  };

  // Biểu đồ Pie cho giảng viên
  const tutorPieData = {
    labels: ['Giảng viên đã có lớp', 'Giảng viên chưa có lớp'],
    datasets: [
      {
        label: 'Số giảng viên',
        data: [stats.totalAssignedTutors, stats.totalUnassignedTutors],
        backgroundColor: ['#2196F3', '#FF5722'],
        borderColor: ['#2196F3', '#FF5722'],
        borderWidth: 1,
      },
    ],
  };

  // Biểu đồ Pie cho lớp học
  const classPieData = {
    labels: ['Lớp đã được phân bổ', 'Lớp chưa được phân bổ'],
    datasets: [
      {
        label: 'Số lớp học',
        data: [stats.totalClassAssigned, stats.totalClassUnassigned],
        backgroundColor: ['#8BC34A', '#FFC107'],
        borderColor: ['#8BC34A', '#FFC107'],
        borderWidth: 1,
      },
    ],
  };

  // Biểu đồ Pie cho lịch học và điểm danh
  const schedulePieData = {
    labels: ['Điểm danh - Có mặt', 'Điểm danh - Vắng mặt'],
    datasets: [
      {
        label: 'Điểm danh',
        data: [stats.presentCount, stats.absentCount],
        backgroundColor: ['#FFEB3B', '#F44336'],
        borderColor: ['#FFEB3B', '#F44336'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div>
        <p><strong>Tổng số sinh viên:</strong> {stats.totalStudents}</p>
        <p><strong>Số sinh viên chưa có lớp:</strong> {stats.totalUnassignedStudents}</p>
        <p><strong>Số sinh viên đã có lớp:</strong> {stats.totalAssignedStudents}</p>

        {/* Các biểu đồ Pie được hiển thị trong 2 hàng */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
          {/* Hàng đầu tiên: 2 biểu đồ */}
          <div style={{ width: '45%', margin: '10px', textAlign: 'center' }}>
            <Pie data={studentPieData} />
            <p><strong>Sinh viên</strong></p>
          </div>
          <div style={{ width: '45%', margin: '10px', textAlign: 'center' }}>
            <Pie data={tutorPieData} />
            <p><strong>Giảng viên</strong></p>
          </div>

          {/* Hàng thứ hai: 2 biểu đồ */}
          <div style={{ width: '45%', margin: '10px', textAlign: 'center' }}>
            <Pie data={classPieData} />
            <p><strong>Lớp học</strong></p>
          </div>
          <div style={{ width: '45%', margin: '10px', textAlign: 'center' }}>
            <Pie data={schedulePieData} />
            <p><strong>Lịch học & Điểm danh</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
