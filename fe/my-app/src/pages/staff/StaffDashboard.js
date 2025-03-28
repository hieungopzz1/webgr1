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
    absentCount: 0,
    totalUnassignedStudents:0,
    totalAssignedStudents:0,
    totalAssignedTutors:0,
    totalUnassignedTutors:0,
    totalSchedules:0,
    totalClassAssigned:0,
    totalClassUnassigned:0
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

    // 🔥 Khi có sự kiện 'updateDashboard', gọi lại API
    socket.on("updateDashboard", () => {
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
        <p><strong>Tổng số lịch học đã tạo:</strong> {stats.totalSchedules}</p>
        <p><strong>Điểm danh - Có mặt:</strong> {stats.presentCount}</p>
        <p><strong>Điểm danh - Vắng mặt:</strong> {stats.absentCount}</p>
        <p><strong>Số sinh viên chưa có lớp:</strong> {stats.totalUnassignedStudents}</p>
        <p><strong>Số sinh viên dã có lớp:</strong> {stats.totalAssignedStudents}</p>
        <p><strong>Số giang viên chưa có lớp:</strong> {stats.totalUnassignedTutors}</p>
        <p><strong>Số giang viên dã có lớp:</strong> {stats.totalAssignedTutors}</p>
        <p><strong>Số lớp chưa được phân bổ:</strong> {stats.totalClassUnassigned}</p>
        <p><strong>Số lớp đã được phân bổ:</strong> {stats.totalClassAssigned}</p>
      </div>
    </div>
  );
};

export default StaffDashboard;
