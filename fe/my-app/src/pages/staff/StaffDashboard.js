import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import api from '../../utils/api';

const socket = io("http://localhost:5001");

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTutors: 0,
    totalClasses: 0,
    presentCount: 0,
    absentCount: 0
  });

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // 🔥 Khi có sự kiện 'updateDashboard', gọi lại API
    socket.on("updateDashboard", () => {
      console.log("🔄 Admin thêm class mới → Cập nhật Dashboard");
      fetchDashboardData();  // Gọi lại API để cập nhật dữ liệu
    });

    return () => {
      socket.off("updateDashboard");
    };

  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div>
        <p><strong>Tổng số sinh viên:</strong> {stats.totalStudents}</p>
        <p><strong>Tổng số giảng viên:</strong> {stats.totalTutors}</p>
        <p><strong>Tổng số lớp học:</strong> {stats.totalClasses}</p>
        <p><strong>Điểm danh - Có mặt:</strong> {stats.presentCount}</p>
        <p><strong>Điểm danh - Vắng mặt:</strong> {stats.absentCount}</p>
      </div>
    </div>
  );
};

export default StaffDashboard;
