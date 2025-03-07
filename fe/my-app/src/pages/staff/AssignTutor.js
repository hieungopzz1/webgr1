import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AssignTutor.css';

const AssignTutor = () => {
  // States
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchTutors();
    fetchStudents();
    fetchAssignments();
  }, []);

  // Fetch functions
  const fetchTutors = async () => {
    try {
      const response = await api.get('/api/admin/tutors');
      setTutors(response.data);
    } catch (err) {
      setError('Failed to fetch tutors');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/admin/students');
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students');
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/api/admin/getassign');
      setAssignments(response.data);
    } catch (err) {
      setError('Failed to fetch assignments');
    }
  };

  // Handle functions
  const handleTutorChange = (e) => {
    setSelectedTutor(e.target.value);
    setSelectedStudents([]);
  };

  const handleStudentChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedStudents(value);
  };

  const handleSingleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTutor || selectedStudents.length !== 1) {
      setError('Please select one tutor and one student');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      await api.post('/api/admin/assign', {
        assigned_by: userData.id,
        tutor_id: selectedTutor,
        student_id: selectedStudents[0]
      });
      setSuccess('Successfully assigned tutor to student');
      fetchAssignments();
      setSelectedTutor('');
      setSelectedStudents([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTutor || selectedStudents.length === 0) {
      setError('Please select one tutor and at least one student');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      await api.post('/api/admin/assigns', {
        assigned_by: userData.id,
        tutor_id: selectedTutor,
        student_ids: selectedStudents
      });
      setSuccess('Successfully assigned tutor to students');
      fetchAssignments();
      setSelectedTutor('');
      setSelectedStudents([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await api.delete(`/api/admin/assign/${assignmentId}`);
      setSuccess('Successfully deleted assignment');
      fetchAssignments();
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  return (
    <div className="assign-tutor-container">
      <h2>Assign Tutor to Students</h2>
      
      <div className="assign-forms">
        {/* Single Assignment Form */}
        <div className="assign-form">
          <h3>Single Assignment</h3>
          <form onSubmit={handleSingleAssign}>
            <div className="form-group">
              <label>Select Tutor:</label>
              <select 
                value={selectedTutor} 
                onChange={handleTutorChange}
                required
              >
                <option value="">Choose a tutor...</option>
                {tutors.map(tutor => (
                  <option key={tutor._id} value={tutor._id}>
                    {tutor.firstName} {tutor.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Student:</label>
              <select 
                value={selectedStudents[0] || ''} 
                onChange={(e) => setSelectedStudents([e.target.value])}
                required
              >
                <option value="">Choose a student...</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Tutor'}
            </button>
          </form>
        </div>

        {/* Multiple Assignment Form */}
        <div className="assign-form">
          <h3>Multiple Assignment</h3>
          <form onSubmit={handleMultipleAssign}>
            <div className="form-group">
              <label>Select Tutor:</label>
              <select 
                value={selectedTutor} 
                onChange={handleTutorChange}
                required
              >
                <option value="">Choose a tutor...</option>
                {tutors.map(tutor => (
                  <option key={tutor._id} value={tutor._id}>
                    {tutor.firstName} {tutor.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Students:</label>
              <select 
                multiple
                value={selectedStudents}
                onChange={handleStudentChange}
                required
              >
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Multiple Students'}
            </button>
          </form>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Assignments List */}
      <div className="assignments-list">
        <h3>Current Assignments</h3>
        <table>
          <thead>
            <tr>
              <th>Tutor</th>
              <th>Student</th>
              <th>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment._id}>
                <td>
                  {assignment.tutor_id?.firstName} {assignment.tutor_id?.lastName}
                </td>
                <td>
                  {assignment.student_id?.firstName} {assignment.student_id?.lastName}
                </td>
                <td>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => handleDeleteAssignment(assignment._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignTutor;