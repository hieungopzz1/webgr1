import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import api from '../../../utils/api';
import { API_ROUTES } from '../../../utils/constants';
import './ClassStudents.css';

const ClassStudents = () => {
  const { classId } = useParams();
  const history = useHistory();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ROUTES.TUTOR.GET_CLASS_STUDENTS(classId));
      setClassInfo(response.data.class);
      setStudents(response.data.students || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách sinh viên');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) {
      fetchStudents();
    }
  }, [classId, fetchStudents]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = students.filter(student => {
    const searchValue = searchTerm.toLowerCase();
    return (
      student.student_ID?.toLowerCase().includes(searchValue) ||
      student.firstName?.toLowerCase().includes(searchValue) ||
      student.lastName?.toLowerCase().includes(searchValue) ||
      student.email?.toLowerCase().includes(searchValue) ||
      (student.firstName + ' ' + student.lastName)?.toLowerCase().includes(searchValue)
    );
  });

  const handleGoBack = () => {
    history.push('/tutor/classes');
  };

  if (loading) {
    return (
      <div className="class-students-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-students-container">
        <div className="error-message">
          <h2>Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchStudents}>
            Thử lại
          </button>
          <button className="back-button" onClick={handleGoBack}>
            Quay lại danh sách lớp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="class-students-container">
      <div className="page-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleGoBack}>
            &larr; Quay lại
          </button>
        </div>
        
        <h1>Danh sách sinh viên - {classInfo?.class_name}</h1>
        <div className="class-info">
          <span className="info-item">
            <strong>Môn học:</strong> {classInfo?.subject}
          </span>
          <span className="info-item">
            <strong>Chuyên ngành:</strong> {classInfo?.major}
          </span>
          <span className="info-item">
            <strong>Số sinh viên:</strong> {students.length}
          </span>
        </div>
      </div>
      
      <div className="actions-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, tên hoặc email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>
      
      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <p>Không tìm thấy sinh viên phù hợp với từ khóa "{searchTerm}"</p>
          ) : (
            <p>Lớp học này chưa có sinh viên nào.</p>
          )}
        </div>
      ) : (
        <div className="students-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Mã sinh viên</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Chuyên ngành</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student._id}>
                  <td>{student.student_ID}</td>
                  <td>
                    <div className="student-name">
                      {student.avatar && (
                        <img 
                          src={student.avatar} 
                          alt={`${student.firstName} ${student.lastName}`} 
                          className="student-avatar" 
                        />
                      )}
                      <span>{student.firstName} {student.lastName}</span>
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>{student.major}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClassStudents; 