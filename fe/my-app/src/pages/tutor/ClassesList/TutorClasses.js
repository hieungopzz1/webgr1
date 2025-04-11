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
      success('Successfully loaded class list');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Unable to load class list';
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
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-classes-container">
        <div className="error-message">
          <h2>An error occurred</h2>
          <p>{error}</p>
          <button 
            className="retry-button" 
            onClick={() => user && fetchClasses(user.id)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="tutor-classes-container">
        <div className="empty-state">
          <h2>No classes assigned</h2>
          <p>You haven't been assigned to teach any classes yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-classes-container">
      <div className="page-header">
        <h1>Class List</h1>
        <p>Manage the classes assigned to you</p>
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
                <span className="detail-label">Major:</span>
                <span className="detail-value">{cls.major}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Number of students:</span>
                <span className="detail-value">{cls.studentCount || 0}</span>
              </div>
            </div>
            
            <div className="class-actions">
              <Link 
                to={`/tutor/class/${cls._id}/students`} 
                className="view-students-btn"
                onClick={() => success(`Opening student list for class ${cls.class_name}`)}
              >
                View student list
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorClasses; 