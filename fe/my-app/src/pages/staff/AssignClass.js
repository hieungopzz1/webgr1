import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import api from '../../utils/api';
import './AssignClass.css';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import Modal from '../../components/modal/Modal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { getUserData, isAuthenticated } from '../../utils/storage';
import { useToast } from '../../context/ToastContext';

const CreateClassForm = memo(({ onSubmit, loading, tutors, students, onSuccess }) => {
  const [className, setClassName] = useState('');
  const [major, setMajor] = useState('');
  const [subject, setSubject] = useState('');
  const [tutorId, setTutorId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [majorStudents, setMajorStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return majorStudents;
    
    return majorStudents.filter(student => 
      student.student_ID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [majorStudents, searchQuery]);

  const fetchStudentsByMajor = useCallback(async (selectedMajor) => {
    if (!selectedMajor) {
      setMajorStudents([]);
      return;
    }
    
    setLoadingStudents(true);
    try {
      const response = await api.get(`/api/assign-student/major?major=${selectedMajor}`);
      if (response.data && Array.isArray(response.data.students)) {
        setMajorStudents(response.data.students);
      } else {
        setMajorStudents([]);
      }
    } catch (err) {
      setMajorStudents([]);
      setErrors(prev => ({ 
        ...prev, 
        apiError: `Error loading students: ${err.message || 'Unknown error'}`
      }));
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!className.trim()) {
      newErrors.className = 'Class name is required';
    }
    
    if (!major) {
      newErrors.major = 'Major is required';
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
  }, [className, major, subject, tutorId, selectedStudents]);

  const handleMajorChange = useCallback((e) => {
    const newMajor = e.target.value;
    setMajor(newMajor);
    setSelectedStudents([]);
    
    fetchStudentsByMajor(newMajor);
    
    if (newMajor && errors.major) {
      setErrors(prev => ({ ...prev, major: undefined }));
    }
  }, [errors, fetchStudentsByMajor]);

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
      setMajor('');
      setSubject('');
      setTutorId('');
      setSelectedStudents([]);
      setMajorStudents([]);
    }
  }, [loading, errors]);

  const handleStudentSelect = useCallback((studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
    
    if (selectedStudents.length > 0 && errors.students) {
      setErrors(prev => ({ ...prev, students: undefined }));
    }
  }, [selectedStudents.length, errors]);
  
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
    setMajor('');
    setSubject('');
    setTutorId('');
    setSelectedStudents([]);
    setSearchQuery('');
    setMajorStudents([]);
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
      {errors.apiError && <div className="error-message">{errors.apiError}</div>}
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
            <label htmlFor="major" className={errors.major ? 'error-label' : ''}>Major*</label>
            <select 
              id="major"
              value={major} 
              onChange={handleMajorChange}
              required
              className={`form-select ${errors.major ? 'error-input' : ''}`}
            >
              <option value="">Select major...</option>
              <option value="IT">IT</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
            </select>
            {errors.major && <div className="error-message">{errors.major}</div>}
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
            Assign Students*
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
          
          {!major ? (
            <div className="select-major-message">
              Please select a major first to view available students
            </div>
          ) : loadingStudents ? (
            <div className="loading-students">
              <Loader size="small" />
              <p>Loading students...</p>
            </div>
          ) : (
            <div className="student-checkbox-list">
              {filteredStudents.length === 0 ? (
                <p className="no-results">
                  {searchQuery 
                    ? 'No students found matching your search.' 
                    : `No students found with major "${major}".`}
                </p>
              ) : (
                filteredStudents.map(student => (
                  <div key={student._id} className="student-checkbox-item">
                    <input
                      type="checkbox"
                      id={`student-${student._id}`}
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleStudentSelect(student._id)}
                    />
                    <label htmlFor={`student-${student._id}`}>
                      {student.firstName} {student.lastName} ({student.studentId || student.student_ID || 'No ID'})
                    </label>
                  </div>
                ))
              )}
            </div>
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
          disabled={loading || !major || !tutorId || selectedStudents.length === 0}
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
  const [dataLoading, setDataLoading] = useState(true);
  const toast = useToast();
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  
  // Ref for reset form function
  const [resetCreateForm, setResetCreateForm] = useState(null);
  
  const initialLoadRef = useRef(false);
  
  const showToast = useCallback((type, message) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else if (type === 'warning') toast.warning(message);
  }, [toast]);
  
  // Utility function xử lý lỗi
  const handleApiError = useCallback((err, defaultMessage) => {
    let errorMsg = defaultMessage || 'An error occurred';
    
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
        errorMsg = 'You do not have permission to perform this action.';
      } else if (err.response.data?.message) {
        errorMsg = err.response.data.message;
      }
    } else if (err.request) {
      errorMsg = 'No response received from server. Please check your connection.';
    } else {
      errorMsg = `Error: ${err.message}`;
    }
    
    showToast('error', errorMsg);
    return errorMsg;
  }, [showToast]);

  // Callback to store the reset function
  const handleFormReset = useCallback((resetFunc) => {
    setResetCreateForm(() => resetFunc);
  }, []);

  // Improved fetchClasses
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
      handleApiError(err, 'Failed to fetch classes');
      return err;
    }
  }, [handleApiError]);

  // Improved fetchStudents with proper error handling
  const fetchStudents = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/get-users');
      if (response.data && Array.isArray(response.data.users)) {
        const studentsList = response.data.users.filter(user => user.role === 'Student');
        setStudents(studentsList);
      } else {
        setStudents([]);
        showToast('warning', 'No students found or invalid data format received');
      }
      return response;
    } catch (err) {
      handleApiError(err, 'Failed to fetch students');
      setStudents([]);
      return err;
    }
  }, [handleApiError, showToast]);

  // Improved fetchTutors with proper error handling
  const fetchTutors = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/get-users');
      if (response.data && Array.isArray(response.data.users)) {
        const tutorsList = response.data.users.filter(user => user.role === 'Tutor');
        setTutors(tutorsList);
      } else {
        setTutors([]);
        showToast('warning', 'No tutors found or invalid data format received');
      }
      return response;
    } catch (err) {
      handleApiError(err, 'Failed to fetch tutors');
      setTutors([]);
      return err;
    }
  }, [handleApiError, showToast]);

  useEffect(() => {
    if (initialLoadRef.current || !isAuthenticated()) {
      return;
    }
    
    const loadData = async () => {
      if (!isAuthenticated()) {
        showToast('error', 'Authentication required. Please log in again.');
        return;
      }
      
      setDataLoading(true);
      
      try {
        await Promise.all([fetchClasses(), fetchStudents(), fetchTutors()]);
        if (!initialLoadRef.current) {
          showToast('success', 'Data loaded successfully');
          initialLoadRef.current = true;
        }
      } catch (err) {
        console.error('Error during data loading:', err);
      } finally {
        setDataLoading(false);
      }
    };
    
    loadData();
  }, [fetchClasses, fetchStudents, fetchTutors, showToast]);

  // Event handlers
  const handleCreateClass = useCallback(async (formData) => {
    if (!formData.className || !formData.major || !formData.subject || !formData.tutorId || !formData.studentIds.length) {
      showToast('error', 'Please fill in all required fields and select at least one student');
      return;
    }

    const className = formData.className.trim();
    if (!className) {
      showToast('error', 'Class name cannot be empty');
      return;
    }

    setLoading(true);

    try {
      const userData = getUserData();
      
      if (!userData || !userData.id) {
        showToast('error', 'Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        const classesResponse = await api.get('/api/class/get-all-class');
        const existingClasses = Array.isArray(classesResponse.data) ? classesResponse.data : [];
        
        const classExists = existingClasses.some(c => c.class_name === className);
        
        if (classExists) {
          showToast('error', `Class name "${className}" already exists. Please use a different name.`);
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
        showToast('error', 'Invalid server response when creating class');
        setLoading(false);
        return;
      }
      
      const newClassId = classResponse.data.class?._id;
      
      if (!newClassId) {
        showToast('error', 'Class created but could not retrieve class ID');
        setLoading(false);
        return;
      }
      
      try {
        await api.post('/api/assign-student', {
          studentIds: formData.studentIds,
          classId: newClassId,
          adminId: userData.id
        });
        
        showToast('success', 'Class created successfully with assigned students and tutor');
        
        // Reset form after successful creation
        if (resetCreateForm) {
          resetCreateForm();
        }
      } catch (assignError) {
        showToast('warning', 'Class created successfully, but failed to assign students');
        
        // Reset form even if student assignment fails
        if (resetCreateForm) {
          resetCreateForm();
        }
      }
      
      fetchClasses();
    } catch (err) {
      handleApiError(err, 'Failed to create class');
    } finally {
      setLoading(false);
    }
  }, [fetchClasses, resetCreateForm, handleApiError, showToast]);

  const handleDeleteStudent = useCallback(async (studentId, classId) => {
    // Tìm thông tin sinh viên và lớp để hiển thị thông báo
    const studentData = students.find(s => s._id === studentId);
    const studentName = studentData ? `${studentData.firstName} ${studentData.lastName}` : 'Student';
    
    setLoading(true);

    try {
      if (!isAuthenticated()) {
        showToast('error', 'Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      await api.delete('/api/assign-student/remove', { 
        data: { 
          studentId,
          classId
        } 
      });
      
      showToast('success', `${studentName} removed successfully`);
      
      if (isDetailModalOpen && selectedClassDetail) {
        setIsDetailModalOpen(false);
        setTimeout(() => {
          setIsDetailModalOpen(true);
        }, 100);
      }
    } catch (err) {
      handleApiError(err, `Failed to remove ${studentName} from class`);
    } finally {
      setLoading(false);
    }
  }, [isDetailModalOpen, selectedClassDetail, students, handleApiError, showToast]);

  const handleDeleteClass = useCallback(async (classId) => {
    setClassToDelete(classId);
    setIsConfirmModalOpen(true);
  }, []);
  
  const confirmDeleteClass = useCallback(async () => {
    if (!classToDelete) return;
    
    // Optimistic update - xóa class khỏi UI ngay lập tức
    const classToDeleteData = classes.find(c => c._id === classToDelete);
    const className = classToDeleteData?.class_name || 'Class';
    
    setClasses(prev => prev.filter(c => c._id !== classToDelete));
    setIsConfirmModalOpen(false);
    
    // Hiển thị thông báo đang xử lý
    setLoading(true);
    
    try {
      await api.delete(`/api/class/delete-class/${classToDelete}`);
      showToast('success', `${className} deleted successfully`);
      // Không cần fetchClasses vì đã cập nhật UI
    } catch (err) {
      // Hoàn tác UI change nếu API call thất bại
      handleApiError(err, `Failed to delete ${className}`);
      setClasses(prev => [...prev, classToDeleteData]); 
    } finally {
      setLoading(false);
      setClassToDelete(null);
    }
  }, [classToDelete, classes, handleApiError, showToast]);

  const handleClassClick = useCallback((classData) => {
    setSelectedClassDetail(classData);
    setIsDetailModalOpen(true);
  }, []);

  const isDataLoaded = !dataLoading;

  // Thêm hàm xử lý update class
  const handleUpdateClass = useCallback(async (updateData) => {
    setLoading(true);

    try {
      await api.put(`/api/class/update-class/${updateData.classId}`, {
        class_name: updateData.class_name,
        major: updateData.major,
        subject: updateData.subject,
        tutor_id: updateData.tutor_id
      });
      
      showToast('success', 'Class updated successfully');
      fetchClasses();
    } catch (err) {
      handleApiError(err, 'Failed to update class');
    } finally {
      setLoading(false);
    }
  }, [fetchClasses, handleApiError, showToast]);

  return (
    <div className="assign-class-container">
      <h2 className="page-title">Class Management</h2>

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