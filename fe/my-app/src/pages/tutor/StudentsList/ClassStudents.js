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
      
      const response = await api.get(`/api/class/${classId}/students`);
      setClassInfo(response.data.classInfo || {});
      setStudents(response.data.students || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load student list');
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
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-students-container">
        <div className="error-message">
          <h2>An error occurred</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchStudents}>
            Retry
          </button>
          <button className="back-button" onClick={handleGoBack}>
            Back to class list
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
            &larr; Back
          </button>
        </div>
        
        <h1>Student List - {classInfo?.class_name}</h1>
        <div className="class-info">
          <span className="info-item">
            <strong>Subject:</strong> {classInfo?.subject}
          </span>
          <span className="info-item">
            <strong>Major:</strong> {classInfo?.major}
          </span>
          <span className="info-item">
            <strong>Number of students:</strong> {students.length}
          </span>
        </div>
      </div>
      
      <div className="actions-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by ID, name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>
      
      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <p>No students found matching "{searchTerm}"</p>
          ) : (
            <p>This class has no students yet.</p>
          )}
        </div>
      ) : (
        <div className="students-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Major</th>
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