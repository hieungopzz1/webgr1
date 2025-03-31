import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import api from '../../utils/api';
import './AssignClass.css';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import Modal from '../../components/modal/Modal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { getUserData, isAuthenticated } from '../../utils/storage';

const CreateClassForm = memo(({ onSubmit, loading, tutors, students, onSuccess }) => {
  const [className, setClassName] = useState('');
  const [major, setMajor] = useState('IT');
  const [subject, setSubject] = useState('');
  const [tutorId, setTutorId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    
    return students.filter(student => 
      student.student_ID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!className.trim()) {
      newErrors.className = 'Class name is required';
    }
    
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!tutorId) {
      newErrors.tutorId = 'Please select a tutor';
    }
    
    if (selectedStudents.length === 0) {
      newErrors.students = 'At least one student must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [className, subject, tutorId, selectedStudents]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit({ 
      className: className.trim(), 
      major, 
      subject: subject.trim(), 
      tutorId, 
      studentIds: selectedStudents 
    });
  }, [className, major, subject, tutorId, selectedStudents, onSubmit, validateForm]);

  useEffect(() => {
    if (!loading && !errors) {
      setClassName('');
      setMajor('IT');
      setSubject('');
      setTutorId('');
      setSelectedStudents([]);
    }
  }, [loading, errors]);

  const handleStudentSelect = useCallback((e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedStudents(value);
    
    if (value.length > 0 && errors.students) {
      setErrors(prev => ({ ...prev, students: undefined }));
    }
  }, [errors]);
  
  const handleClassNameChange = useCallback((e) => {
    const value = e.target.value;
    setClassName(value);
    
    if (value.trim() && errors.className) {
      setErrors(prev => ({ ...prev, className: undefined }));
    }
  }, [errors]);
  
  const handleSubjectChange = useCallback((e) => {
    const value = e.target.value;
    setSubject(value);
    
    if (value.trim() && errors.subject) {
      setErrors(prev => ({ ...prev, subject: undefined }));
    }
  }, [errors]);
  
  const handleTutorChange = useCallback((e) => {
    const value = e.target.value;
    setTutorId(value);
    
    if (value && errors.tutorId) {
      setErrors(prev => ({ ...prev, tutorId: undefined }));
    }
  }, [errors]);
  
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Reset form function
  const resetForm = useCallback(() => {
    setClassName('');
    setMajor('IT');
    setSubject('');
    setTutorId('');
    setSelectedStudents([]);
    setSearchQuery('');
    setErrors({});
  }, []);
  
  // Expose reset form function via ref
  useEffect(() => {
    if (onSuccess) {
      onSuccess(resetForm);
    }
  }, [onSuccess, resetForm]);

  return (
    <div className="create-class-form">
      <h3>Create New Class</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <InputField 
              label="Class Name*"
              value={className} 
              onChange={handleClassNameChange}
              required
              fullWidth
              error={errors.className}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="major">Major*</label>
            <select 
              id="major"
              value={major} 
              onChange={(e) => setMajor(e.target.value)}
              required
              className="form-select"
            >
              <option value="IT">IT</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <InputField 
            label="Subject*"
            value={subject} 
            onChange={handleSubjectChange}
            required
            fullWidth
            error={errors.subject}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tutor" className={errors.tutorId ? 'error-label' : ''}>Assign Tutor*</label>
          <select 
            id="tutor"
            value={tutorId} 
            onChange={handleTutorChange}
            required
            className={`form-select ${errors.tutorId ? 'error-input' : ''}`}
          >
            <option value="">Select a tutor...</option>
            {tutors.map(tutor => (
              <option key={tutor._id} value={tutor._id}>
                {tutor.firstName} {tutor.lastName}
              </option>
            ))}
          </select>
          {errors.tutorId && <div className="error-message">{errors.tutorId}</div>}
        </div>
        
        <div className="form-group student-selection">
          <label className={errors.students ? 'error-label' : ''}>
            Assign Students* (hold Ctrl/Cmd to select multiple)
          </label>
          
          <div className="search-container">
            <InputField
              type="text"
              placeholder="Search by Student ID or Name..."
              value={searchQuery}
              onChange={handleSearchChange}
              fullWidth
              endAdornment={
                searchQuery && (
                  <button 
                    className="clear-search" 
                    onClick={() => setSearchQuery('')}
                    type="button"
                  >
                    ×
                  </button>
                )
              }
            />
          </div>
          
          <select 
            multiple
            value={selectedStudents}
            onChange={handleStudentSelect}
            required
            className={`multiple-select ${errors.students ? 'error-input' : ''}`}
            size={5}
          >
            {filteredStudents.map(student => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} ({student.student_ID || 'No ID'})
              </option>
            ))}
          </select>
          
          {filteredStudents.length === 0 && searchQuery && (
            <p className="no-results">No students found matching your search.</p>
          )}
          
          <div className="selection-info">
            {selectedStudents.length > 0 ? (
              <small>Selected: {selectedStudents.length} student(s)</small>
            ) : (
              <small className={errors.students ? 'error-text' : 'required-field'}>
                At least one student must be selected
              </small>
            )}
          </div>
          {errors.students && <div className="error-message">{errors.students}</div>}
        </div>
        
        <Button 
          type="submit" 
          disabled={loading || !tutorId || selectedStudents.length === 0}
          variant="primary"
          fullWidth
        >
          {loading ? 'Creating...' : 'Create Class with Assignments'}
        </Button>
      </form>
    </div>
  );
});

const ClassesList = memo(({ classes, onClassClick, onDeleteClass }) => {
  if (classes.length === 0) {
    return <p>No classes found</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Class Name</th>
          <th>Major</th>
          <th>Subject</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {classes.map(classItem => (
          <tr key={classItem._id} onClick={() => onClassClick(classItem)} className="clickable-row">
            <td>{classItem.class_name}</td>
            <td>{classItem.major}</td>
            <td>{classItem.subject}</td>
            <td>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClass(classItem._id);
                }}
                variant="danger"
                size="small"
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

const EditClassModal = memo(({ isOpen, onClose, classData, tutors, loading, onSave }) => {
  const [formData, setFormData] = useState({
    className: '',
    major: 'IT',
    subject: '',
    tutorId: ''
  });
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Cập nhật form khi classData thay đổi
  useEffect(() => {
    if (classData) {
      setFormData({
        className: classData.class_name || '',
        major: classData.major || 'IT',
        subject: classData.subject || '',
        tutorId: classData.tutor || ''
      });
    }
  }, [classData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.className.trim()) {
      newErrors.className = 'Class name is required';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.tutorId) {
      newErrors.tutorId = 'Please select a tutor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it has a value
    if (value && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaveLoading(true);
    
    try {
      await onSave({
        classId: classData._id,
        class_name: formData.className.trim(),
        major: formData.major,
        subject: formData.subject.trim(),
        tutor_id: formData.tutorId
      });
      
      onClose();
    } finally {
      setSaveLoading(false);
    }
  };
  
  if (!classData) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Class: ${classData.class_name}`}>
      <form onSubmit={handleSubmit} className="edit-class-form">
        <div className="form-group">
          <InputField 
            label="Class Name*"
            value={formData.className} 
            onChange={(e) => handleChange('className', e.target.value)}
            required
            fullWidth
            error={errors.className}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="major">Major*</label>
          <select 
            id="major"
            value={formData.major} 
            onChange={(e) => handleChange('major', e.target.value)}
            required
            className="form-select"
          >
            <option value="IT">IT</option>
            <option value="Business">Business</option>
            <option value="Design">Design</option>
          </select>
        </div>
        
        <div className="form-group">
          <InputField 
            label="Subject*"
            value={formData.subject} 
            onChange={(e) => handleChange('subject', e.target.value)}
            required
            fullWidth
            error={errors.subject}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tutor" className={errors.tutorId ? 'error-label' : ''}>Assign Tutor*</label>
          <select 
            id="tutor"
            value={formData.tutorId} 
            onChange={(e) => handleChange('tutorId', e.target.value)}
            required
            className={`form-select ${errors.tutorId ? 'error-input' : ''}`}
          >
            <option value="">Select a tutor...</option>
            {tutors.map(tutor => (
              <option key={tutor._id} value={tutor._id}>
                {tutor.firstName} {tutor.lastName}
              </option>
            ))}
          </select>
          {errors.tutorId && <div className="error-message">{errors.tutorId}</div>}
        </div>
        
        <div className="form-actions">
          <Button 
            type="button" 
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saveLoading}
            variant="primary"
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

const AssignClass = () => {
  // State
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  
  // Ref for reset form function
  const [resetCreateForm, setResetCreateForm] = useState(null);
  
  // Callback to store the reset function
  const handleFormReset = useCallback((resetFunc) => {
    setResetCreateForm(() => resetFunc);
  }, []);

  // Fetch data
  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get('/api/class/get-all-class');
      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else {
        setClasses([]);
      }
      return response;
    } catch (err) {
      return err;
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/get-users');
      const studentsList = response.data.users.filter(user => user.role === 'Student');
      setStudents(studentsList);
      return response;
    } catch (err) {
      return err;
    }
  }, []);

  const fetchTutors = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/get-users');
      const tutorsList = response.data.users.filter(user => user.role === 'Tutor');
      setTutors(tutorsList);
      return response;
    } catch (err) {
      return err;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('Authentication required. Please log in again.');
      return;
    }
    
    setDataLoading(true);
    Promise.all([fetchClasses(), fetchStudents(), fetchTutors()])
      .finally(() => {
        setDataLoading(false);
      });
  }, [fetchClasses, fetchStudents, fetchTutors]);

  // Event handlers
  const handleCreateClass = useCallback(async (formData) => {
    if (!formData.className || !formData.major || !formData.subject || !formData.tutorId || !formData.studentIds.length) {
      setError('Please fill in all required fields and select at least one student');
      return;
    }

    const className = formData.className.trim();
    if (!className) {
      setError('Class name cannot be empty');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = getUserData();
      
      if (!userData || !userData.id) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        const classesResponse = await api.get('/api/class/get-all-class');
        const existingClasses = Array.isArray(classesResponse.data) ? classesResponse.data : [];
        
        const classExists = existingClasses.some(c => c.class_name === className);
        
        if (classExists) {
          setError(`Class name "${className}" already exists. Please use a different name.`);
          setLoading(false);
          return;
        }
      } catch (checkError) {
        // Continue with class creation
      }
      
      const payload = {
        class_name: className,
        major: formData.major.trim(),
        subject: formData.subject.trim(),
        tutor_id: formData.tutorId
      };
      
      const classResponse = await api.post('/api/class/create-class', payload);
      
      if (!classResponse.data) {
        setError('Invalid server response when creating class');
        setLoading(false);
        return;
      }
      
      const newClassId = classResponse.data.class?._id;
      
      if (!newClassId) {
        setError('Class created but could not retrieve class ID');
        setLoading(false);
        return;
      }
      
      try {
        await api.post('/api/assign-student', {
          studentIds: formData.studentIds,
          classId: newClassId,
          adminId: userData.id
        });
        
        setSuccess('Class created successfully with assigned students and tutor');
        
        // Reset form after successful creation
        if (resetCreateForm) {
          resetCreateForm();
        }
      } catch (assignError) {
        setSuccess('Class created successfully, but failed to assign students. Please assign them manually.');
        
        // Reset form even if student assignment fails
        if (resetCreateForm) {
          resetCreateForm();
        }
      }
      
      fetchClasses();
    } catch (err) {
      let errorMsg = 'Failed to create class';
      
      if (err.response) {
        if (err.response.status === 500) {
          if (err.response.data && err.response.data.message) {
            errorMsg = err.response.data.message;
          } else if (err.response.data && err.response.data.error) {
            errorMsg = `Server error: ${err.response.data.error}`;
          } else {
            errorMsg = 'Server error occurred. Please try again later.';
          }
        } else if (err.response.status === 400) {
          if (err.response.data && err.response.data.message) {
            errorMsg = err.response.data.message;
          }
        } else if (err.response.status === 401) {
          errorMsg = 'Authentication required. Please log in again.';
          window.location.href = '/login';
        } else if (err.response.status === 403) {
          errorMsg = 'You do not have permission to create classes.';
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchClasses, resetCreateForm]);

  const handleDeleteStudent = useCallback(async (studentId, classId) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isAuthenticated()) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      await api.delete('/api/assign-student/remove', { 
        data: { 
          studentId,
          classId
        } 
      });
      
      setSuccess('Successfully removed student from class');
      
      if (isDetailModalOpen && selectedClassDetail) {
        setIsDetailModalOpen(false);
        setTimeout(() => {
          setIsDetailModalOpen(true);
        }, 100);
      }
    } catch (err) {
      let errorMessage = 'Failed to remove student from class';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
        window.location.href = '/login';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDetailModalOpen, selectedClassDetail]);

  const handleDeleteClass = useCallback(async (classId) => {
    setClassToDelete(classId);
    setIsConfirmModalOpen(true);
  }, []);
  
  const confirmDeleteClass = useCallback(async () => {
    if (!classToDelete) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.delete(`/api/class/delete-class/${classToDelete}`);
      setSuccess('Class deleted successfully');
      fetchClasses();
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to delete class';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsConfirmModalOpen(false);
      setClassToDelete(null);
    }
  }, [classToDelete, fetchClasses]);

  const handleClassClick = useCallback((classData) => {
    setSelectedClassDetail(classData);
    setIsDetailModalOpen(true);
  }, []);

  const isDataLoaded = !dataLoading;

  // Thêm hàm xử lý update class
  const handleUpdateClass = useCallback(async (updateData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put(`/api/class/update-class/${updateData.classId}`, {
        class_name: updateData.class_name,
        major: updateData.major,
        subject: updateData.subject,
        tutor_id: updateData.tutor_id
      });
      
      setSuccess('Class updated successfully');
      fetchClasses();
    } catch (err) {
      let errorMsg = 'Failed to update class';
      
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.status === 401) {
          errorMsg = 'Authentication required. Please log in again.';
          window.location.href = '/login';
        } else if (err.response.status === 403) {
          errorMsg = 'You do not have permission to update classes.';
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchClasses]);

  return (
    <div className="assign-class-container">
      <h2 className="page-title">Class Management</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!isDataLoaded ? (
        <div className="loading-container">
          <Loader />
        </div>
      ) : (
        <div className="classes-content">
          <CreateClassForm 
            onSubmit={handleCreateClass} 
            loading={loading}
            tutors={tutors}
            students={students}
            onSuccess={handleFormReset}
          />

          <div className="classes-list-container">
            <h3>Available Classes</h3>
            <ClassesList 
              classes={classes} 
              onClassClick={handleClassClick}
              onDeleteClass={handleDeleteClass}
            />
          </div>

          <EditClassModal 
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            classData={selectedClassDetail}
            tutors={tutors}
            loading={loading}
            onSave={handleUpdateClass}
          />
      </div>
      )}
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteClass}
        title="Delete Class"
        message="Are you sure you want to delete this class? All related schedules and assignments will be deleted too."
      />
    </div>
  );
};

export default AssignClass;