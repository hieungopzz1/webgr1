import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { getUserData } from '../../../utils/storage';
import { API_ROUTES } from '../../../utils/constants';
import { useToast } from '../../../context/ToastContext';
import './TutorClasses.css';

const TutorClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { success, error: showError } = useToast();

  const fetchClasses = useCallback(async (tutorId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ROUTES.TUTOR.GET_CLASSES(tutorId));
      setClasses(response.data.classes || []);
      success('Đã tải danh sách lớp học thành công');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải danh sách lớp học';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      fetchClasses(userData.id);
    }
  }, [fetchClasses]);

  if (loading) {
    return (
      <div className="tutor-classes-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-classes-container">
        <div className="error-message">
          <h2>Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button 
            className="retry-button" 
            onClick={() => user && fetchClasses(user.id)}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="tutor-classes-container">
        <div className="empty-state">
          <h2>Chưa có lớp nào được phân công</h2>
          <p>Bạn chưa được phân công giảng dạy lớp nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-classes-container">
      <div className="page-header">
        <h1>Danh sách lớp học</h1>
        <p>Quản lý các lớp học được phân công cho bạn</p>
      </div>
      
      <div className="classes-grid">
        {classes.map((cls) => (
          <div key={cls._id} className="class-card">
            <div className="class-header">
              <h2>{cls.class_name}</h2>
              <div className="class-subject">{cls.subject}</div>
            </div>
            
            <div className="class-details">
              <div className="detail-item">
                <span className="detail-label">Chuyên ngành:</span>
                <span className="detail-value">{cls.major}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số sinh viên:</span>
                <span className="detail-value">{cls.studentCount || 0}</span>
              </div>
            </div>
            
            <div className="class-actions">
              <Link 
                to={`/tutor/class/${cls._id}/students`} 
                className="view-students-btn"
                onClick={() => success(`Đang mở danh sách sinh viên lớp ${cls.class_name}`)}
              >
                Xem danh sách sinh viên
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorClasses; 