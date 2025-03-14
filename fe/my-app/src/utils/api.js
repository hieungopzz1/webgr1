// import db from '../db.json';

// // const api = {
// //   get: (endpoint) => {
// //     return new Promise((resolve) => {
// //       setTimeout(() => {
// //         resolve({ data: db });
// //       }, 300);
// //     });
// //   }
// // };

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // URL của backend API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header cho các request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm các hàm gọi API
export const getStudents = async () => {
  try {
    const response = await api.get('/api/students'); // Giả sử bạn có API trả về danh sách sinh viên
    return response.data;
  } catch (error) {
    console.error('Error fetching students data', error);
    throw error;
  }
};

export const getUpcomingMeetings = async () => {
  const response = await api.get('/api/upcoming-meetings');
  return response.data;
};

export const getReports = async () => {
  const response = await api.get('/api/reports');
  return response.data;
};

export const getMessages = async () => {
  const response = await api.get('/api/messages');
  return response.data;
};

export const getCourses = async () => {
  try {
    const response = await api.get('/api/courses'); // API endpoint để lấy danh sách khóa học
    return response.data;
  } catch (error) {
    console.error('Error fetching courses data', error);
    throw error;
  }
};

export const getCourseDetail = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course details', error);
    throw error;
  }
};

export const getAssignments = async () => {
  try {
    const response = await api.get('/api/assignments');  // API endpoint để lấy danh sách bài tập
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments', error);
    throw error;
  }
};

// API để cập nhật thông tin cá nhân
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/api/profile', userData);  // Endpoint cập nhật thông tin cá nhân
    return response.data;
  } catch (error) {
    console.error('Error updating profile', error);
    throw error;
  }
};

// API để cập nhật mật khẩu
export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/api/password', passwordData);  // Endpoint cập nhật mật khẩu
    return response.data;
  } catch (error) {
    console.error('Error updating password', error);
    throw error;
  }
};

export default api;
