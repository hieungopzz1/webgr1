import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import './ClassManagement.css';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import Modal from '../../components/modal/Modal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { getUserData, isAuthenticated } from '../../utils/storage';
import { useToast } from '../../context/ToastContext';
import { useUser } from '../../context/UserContext';

const ClassManagement = () => {
  const toast = useToast();
  const { users } = useUser();
  
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [classTutor, setClassTutor] = useState(null);
  const [fetchingClassDetails, setFetchingClassDetails] = useState(false);
  
  const [isEditTutorModalOpen, setIsEditTutorModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  const [majorStudents, setMajorStudents] = useState([]);
  const [loadingMajorStudents, setLoadingMajorStudents] = useState(false);
  
  const effectRan = React.useRef(false);
  
  const handleApiError = useCallback((err, defaultMessage) => {
    let errorMsg = defaultMessage || 'An error occurred';
    
    if (err.response) {
      if (err.response.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response.status === 404) {
        errorMsg = 'API endpoint not found. Please check the route configuration.';
      } else if (err.response.status === 401) {
        errorMsg = 'Authentication required. Please log in again.';
      } else if (err.response.status === 403) {
        errorMsg = 'You do not have permission to perform this action.';
      } else if (err.response.status === 500) {
        errorMsg = 'Server error occurred. Please try again later.';
      }
    } else if (err.request) {
      errorMsg = 'No response received from server. Please check your connection.';
    } else {
      errorMsg = `Error: ${err.message}`;
    }
    
    setError(errorMsg);
    toast.error(errorMsg);
    return errorMsg;
  }, [toast]);
  
  const showSuccess = useCallback((message) => {
    setSuccess(message);
    toast.success(message);
    
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  }, [toast]);
  
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
  
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/get-users');
      if (response.data && Array.isArray(response.data.users)) {
        const tutorsList = response.data.users.filter(user => user.role === 'Tutor');
        const studentsList = response.data.users.filter(user => user.role === 'Student');
        setTutors(tutorsList);
        setAllStudents(studentsList);
      }
      return response;
    } catch (err) {
      handleApiError(err, 'Failed to fetch users');
      return err;
    }
  }, [handleApiError]);

  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated()) {
      setError('Authentication required. Please log in again.');
      toast.error('Authentication required. Please log in again.');
      return;
    }
    
    setDataLoading(true);
    
    try {
      await Promise.all([
        fetchClasses(),
        fetchUsers()
      ]);
      toast.info('Class management data loaded successfully');
    } catch (err) {
      handleApiError(err, 'Failed to load initial data');
    } finally {
      setDataLoading(false);
    }
  }, [fetchClasses, fetchUsers, handleApiError, toast]);

  useEffect(() => {
    if (!effectRan.current) {
      loadInitialData();
      effectRan.current = true;
    }
  }, [loadInitialData]);
  
  const fetchClassDetails = useCallback(async (classId) => {
    if (!classId) return;
    
    setFetchingClassDetails(true);
    
    try {
      const usersResponse = await api.get(`/api/class/${classId}/users`);
      if (usersResponse.data) {
        const validStudents = (usersResponse.data.students || [])
          .filter(student => student != null)
          .map(student => ({
            ...student, 
            userRef: true,
            key: `student-${student._id}`
          }));
        
        setClassStudents(validStudents);
        
        if (usersResponse.data.tutor) {
          const tutorId = usersResponse.data.tutor;
          const tutorData = tutors.find(t => t && t._id === tutorId);
          setClassTutor(tutorData || null);
        } else {
          setClassTutor(null);
        }
        
        if (selectedClass && selectedClass.class_name) {
          toast.success(`Loaded class details for ${selectedClass.class_name}`);
        }
      }
    } catch (err) {
      handleApiError(err, 'Failed to fetch class details');
      setClassStudents([]);
      setClassTutor(null);
    } finally {
      setFetchingClassDetails(false);
    }
  }, [tutors, handleApiError, toast, selectedClass]);
  
  useEffect(() => {
    if (classStudents.length > 0 && users.length > 0 && selectedClass) {
      if (fetchingClassDetails || loading) return;

      let shouldUpdate = false;
      const updatedStudents = classStudents.map(student => {
        if (!student || !student._id) return student;
        
        const updatedUser = users.find(u => u && u._id === student._id);
        if (!updatedUser) return student;
        
        if (
          updatedUser.firstName !== student.firstName ||
          updatedUser.lastName !== student.lastName ||
          updatedUser.student_ID !== student.student_ID
        ) {
          shouldUpdate = true;
          return { ...updatedUser, userRef: student.userRef };
        }
        
        return student;
      });
      
      if (shouldUpdate) {
        setClassStudents(updatedStudents);
      }
    }
  }, [users, classStudents, selectedClass, fetchingClassDetails, loading]);

  const handleSelectClass = useCallback((classItem) => {
    if (!classItem || !classItem._id) {
      toast.error('Invalid class selected');
      return;
    }
    
    setSelectedClass(classItem);
    fetchClassDetails(classItem._id);
    toast.info(`Selected class ${classItem.class_name}`);
  }, [fetchClassDetails, toast]);
  
  const filteredClasses = useMemo(() => {
    if (!classSearchQuery.trim()) return classes;
    
    return classes.filter(cls => 
      cls.class_name.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
      cls.subject.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
      cls.major.toLowerCase().includes(classSearchQuery.toLowerCase())
    );
  }, [classes, classSearchQuery]);
  
  const fetchStudentsByMajor = useCallback(async (majorName) => {
    if (!majorName) return;
    
    setLoadingMajorStudents(true);
    try {
      const response = await api.get(`/api/assign-student/major?major=${majorName}`);
      if (response.data && Array.isArray(response.data.students)) {
        setMajorStudents(response.data.students);
      } else {
        setMajorStudents([]);
      }
    } catch (err) {
      handleApiError(err, 'Error fetching students by major');
      setMajorStudents([]);
    } finally {
      setLoadingMajorStudents(false);
    }
  }, [handleApiError]);

  const handleOpenAddStudentModal = useCallback(() => {
    if (selectedClass && selectedClass.major) {
      fetchStudentsByMajor(selectedClass.major);
      setIsAddStudentModalOpen(true);
    }
  }, [selectedClass, fetchStudentsByMajor]);

  const availableStudents = useMemo(() => {
    if (!selectedClass || !majorStudents.length) return [];
    
    const classStudentIds = classStudents.map(s => s._id);
    const availableStudents = majorStudents.filter(s => !classStudentIds.includes(s._id));
    
    if (studentSearchQuery.trim()) {
      return availableStudents.filter(student => 
        student.firstName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        (student.student_ID && student.student_ID.toLowerCase().includes(studentSearchQuery.toLowerCase()))
      );
    }
    
    return availableStudents;
  }, [majorStudents, classStudents, selectedClass, studentSearchQuery]);
  
  const handleUpdateTutor = useCallback(async (newTutorId) => {
    if (!selectedClass) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.put(`/api/class/update-class/${selectedClass._id}`, {
        class_name: selectedClass.class_name,
        major: selectedClass.major,
        subject: selectedClass.subject,
        tutor_id: newTutorId
      });
      
      setSuccess('Tutor updated successfully');
      
      await fetchClasses();
      await fetchClassDetails(selectedClass._id);
      
      setIsEditTutorModalOpen(false);
    } catch (err) {
      handleApiError(err, 'Failed to update tutor');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, fetchClasses, fetchClassDetails, handleApiError]);
  
  const handleAddStudents = useCallback(async (studentIds) => {
    if (!selectedClass || !studentIds.length) return;
    
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
      
      await api.post('/api/assign-student', {
        studentIds,
        classId: selectedClass._id,
        adminId: userData.id
      });
      
      setSuccess('Students added successfully');
      
      await fetchClassDetails(selectedClass._id);
      
      setIsAddStudentModalOpen(false);
    } catch (err) {
      handleApiError(err, 'Failed to add students');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, fetchClassDetails, handleApiError]);
  
  const handleRemoveStudent = useCallback((student) => {
    if (!student || !student._id) {
      toast.error('Invalid student selected');
      return;
    }
    
    setStudentToRemove(student);
    setIsRemoveStudentModalOpen(true);
  }, [toast]);
  
  const confirmRemoveStudent = useCallback(async () => {
    if (!selectedClass || !studentToRemove || !studentToRemove._id) {
      toast.error('Invalid student or class selected');
      setIsRemoveStudentModalOpen(false);
      setStudentToRemove(null);
      return;
    }
    
    const studentId = studentToRemove._id;
    const studentName = `${studentToRemove.firstName} ${studentToRemove.lastName}`;
    
    setClassStudents(prev => prev.filter(s => s._id !== studentId));
    setIsRemoveStudentModalOpen(false);
    setStudentToRemove(null);
    
    setLoading(true);
    setError('');
    setSuccess(`Removing ${studentName}...`);
    
    try {
      await api.delete('/api/assign-student/remove', {
        data: {
          studentId,
          classId: selectedClass._id
        }
      });
      
      setSuccess(`${studentName} removed successfully`);
    } catch (err) {
      setClassStudents(prev => [...prev, studentToRemove]);
      handleApiError(err, `Failed to remove ${studentName}`);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, studentToRemove, toast, handleApiError]);
  
  const handleStudentSelect = (studentId) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };
  
  const renderClassList = () => (
    <div className="class-management-sidebar">
      <h3>Classes</h3>
      
      <div className="search-container">
        <InputField
          type="text"
          placeholder="Search classes..."
          value={classSearchQuery}
          onChange={(e) => setClassSearchQuery(e.target.value)}
          fullWidth
          endAdornment={
            classSearchQuery && (
              <button 
                className="clear-search" 
                onClick={() => setClassSearchQuery('')}
                type="button"
              >
                ×
              </button>
            )
          }
        />
      </div>
      
      <div className="classes-list">
        {filteredClasses.length === 0 ? (
          <p className="no-data">No classes found</p>
        ) : (
          filteredClasses.map(classItem => (
            <div 
              key={classItem._id} 
              className={`class-item ${selectedClass && selectedClass._id === classItem._id ? 'selected' : ''}`}
              onClick={() => handleSelectClass(classItem)}
            >
              <h4>{classItem.class_name}</h4>
              <div className="class-item-details">
                <span>{classItem.subject}</span>
                <span className="badge">{classItem.major}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
  
  const renderStudents = (students) => {
    if (!students || students.length === 0) {
      return <p className="no-data">No students assigned to this class</p>;
    }
    
    return (
      <div className="students-list">
        {students.map((student, index) => {
          if (!student || !student._id) return null;
          
          const uniqueKey = `student-${student._id}-${index}`;
          const firstName = student?.firstName || 'N/A';
          const lastName = student?.lastName || 'N/A';
          const studentIdDisplay = student?.student_ID || 'No ID';
          
          return (
            <div key={uniqueKey} className="student-card">
              <div className="student-info">
                <h4>{firstName} {lastName}</h4>
                <p>{studentIdDisplay}</p>
              </div>
              <Button 
                variant="danger" 
                size="small"
                onClick={() => handleRemoveStudent(student)}
              >
                Remove
              </Button>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderClassDetails = () => {
    if (!selectedClass) {
      return (
        <div className="class-management-content empty-state">
          <p>Select a class to view and manage its details</p>
        </div>
      );
    }

    const className = selectedClass?.class_name || 'Class';
    const classMajor = selectedClass?.major || '';
    const classSubject = selectedClass?.subject || '';
    
    return (
      <div className="class-management-content">
        <div className="class-header">
          <h2>{className}</h2>
          <div className="class-info">
            {classMajor && <span className="badge major">{classMajor}</span>}
            {classSubject && <span className="badge subject">{classSubject}</span>}
          </div>
        </div>
        
        {fetchingClassDetails ? (
          <div className="loading-container">
            <Loader />
          </div>
        ) : (
          <>
            <div className="section tutor-section">
              <div className="section-header">
                <h3>Assigned Tutor</h3>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={() => setIsEditTutorModalOpen(true)}
                >
                  Change Tutor
                </Button>
              </div>
              
              {classTutor ? (
                <div className="tutor-card">
                  <div className="tutor-info">
                    <h4>{classTutor?.firstName || ''} {classTutor?.lastName || ''}</h4>
                    <p>{classTutor?.email || ''}</p>
                  </div>
                </div>
              ) : (
                <p className="no-data">No tutor assigned</p>
              )}
            </div>
            
            <div className="section students-section">
              <div className="section-header">
                <h3>Students ({classStudents?.length || 0})</h3>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={handleOpenAddStudentModal}
                >
                  Add Students
                </Button>
              </div>
              
              {renderStudents(classStudents)}
            </div>
          </>
        )}
      </div>
    );
  };
  
  const renderEditTutorModal = () => (
    <Modal 
      isOpen={isEditTutorModalOpen} 
      onClose={() => setIsEditTutorModalOpen(false)}
      title={`Change Tutor: ${selectedClass?.class_name}`}
    >
      <div className="edit-tutor-modal">
        <h3>Select New Tutor</h3>
        <div className="tutors-list">
          {tutors.length === 0 ? (
            <p className="no-data">No tutors available</p>
          ) : (
            tutors.map(tutor => (
              <div key={tutor._id} className="tutor-option">
                <div className="tutor-option-info">
                  <h4>{tutor.firstName} {tutor.lastName}</h4>
                  <p>{tutor.email}</p>
                </div>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={() => handleUpdateTutor(tutor._id)}
                  disabled={loading || (classTutor && classTutor._id === tutor._id)}
                >
                  {loading ? 'Updating...' : (classTutor && classTutor._id === tutor._id) ? 'Current' : 'Assign'}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
  
  const renderAddStudentModal = () => {
    return (
      <Modal 
        isOpen={isAddStudentModalOpen} 
        onClose={() => {
          setIsAddStudentModalOpen(false);
          setSelectedStudentIds([]);
        }}
        title={`Add Students: ${selectedClass?.class_name}`}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (selectedStudentIds.length > 0) {
            handleAddStudents(selectedStudentIds);
            setSelectedStudentIds([]);
          }
        }} className="add-student-form">
          <div className="major-info">
            <p>Showing students with major: <strong>{selectedClass?.major}</strong></p>
          </div>
          
          <div className="search-container">
            <InputField
              type="text"
              placeholder="Search students..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              fullWidth
              endAdornment={
                studentSearchQuery && (
                  <button 
                    className="clear-search" 
                    onClick={() => setStudentSearchQuery('')}
                    type="button"
                  >
                    ×
                  </button>
                )
              }
            />
          </div>
          
          <div className="form-group student-selection">
            <label>Select Students</label>
            
            <div className="student-checkbox-list">
              {loadingMajorStudents ? (
                <div className="loading-students">
                  <Loader size="small" />
                  <p>Loading students...</p>
                </div>
              ) : availableStudents.length === 0 ? (
                <p className="no-results">
                  {studentSearchQuery 
                    ? 'No students found matching your search.' 
                    : `No available students with major "${selectedClass?.major}" to add.`}
                </p>
              ) : (
                availableStudents.map(student => (
                  <div key={student._id} className="student-checkbox-item">
                    <input
                      type="checkbox"
                      id={`student-${student._id}`}
                      checked={selectedStudentIds.includes(student._id)}
                      onChange={() => handleStudentSelect(student._id)}
                    />
                    <label htmlFor={`student-${student._id}`}>
                      {student.firstName} {student.lastName} ({student.student_ID || 'No ID'})
                    </label>
                  </div>
                ))
              )}
            </div>
            
            <div className="selection-info">
              {selectedStudentIds.length > 0 ? (
                <small>Selected: {selectedStudentIds.length} student(s)</small>
              ) : (
                <small className="required-field">At least one student must be selected</small>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <Button 
              type="button" 
              onClick={() => setIsAddStudentModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedStudentIds.length === 0}
              variant="primary"
            >
              {loading ? 'Adding...' : 'Add Selected Students'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  };
  
  const renderRemoveStudentModal = () => (
    <ConfirmModal
      isOpen={isRemoveStudentModalOpen}
      onClose={() => {
        setIsRemoveStudentModalOpen(false);
        setStudentToRemove(null);
      }}
      onConfirm={confirmRemoveStudent}
      title="Remove Student"
      message={`Are you sure you want to remove ${studentToRemove?.firstName} ${studentToRemove?.lastName} from this class?`}
    />
  );
  
  return (
    <div className="class-management-container">
      <h2 className="page-title">Class Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {dataLoading ? (
        <div className="loading-container">
          <Loader />
        </div>
      ) : (
        <div className="class-management-layout">
          {renderClassList()}
          {renderClassDetails()}
        </div>
      )}
      
      {renderEditTutorModal()}
      {renderAddStudentModal()}
      {renderRemoveStudentModal()}
    </div>
  );
};

export default ClassManagement; 