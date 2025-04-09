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

const ClassManagement = () => {
  const toast = useToast();
  
  // Main state
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  
  // Selected class state
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [classTutor, setClassTutor] = useState(null);
  const [fetchingClassDetails, setFetchingClassDetails] = useState(false);
  
  // Modal states
  const [isEditTutorModalOpen, setIsEditTutorModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  
  // Search and filter state
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  // Di chuyển state lên cấp cao nhất
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  // Thêm state để lưu trữ sinh viên theo major
  const [majorStudents, setMajorStudents] = useState([]);
  const [loadingMajorStudents, setLoadingMajorStudents] = useState(false);
  
  // Utility function xử lý lỗi
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
  
  // Fetch classes
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
  
  // Fetch users (tutors and students)
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

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('Authentication required. Please log in again.');
      toast.error('Authentication required. Please log in again.');
      return;
    }
    
    setDataLoading(true);
    
    Promise.all([
      fetchClasses(),
      fetchUsers()
    ]).then(() => {
      toast.info('Đã tải dữ liệu quản lý lớp học');
    }).catch(err => {
      console.error('Error loading initial data:', err);
    }).finally(() => {
      setDataLoading(false);
    });
    
  }, []); 
  
  // Fetch class details (students and tutor)
  const fetchClassDetails = useCallback(async (classId) => {
    if (!classId) return;
    
    setFetchingClassDetails(true);
    
    try {
      // Get class users (students)
      const usersResponse = await api.get(`/api/class/${classId}/users`);
      if (usersResponse.data) {
        setClassStudents(usersResponse.data.students || []);
        
        // Find tutor details
        if (usersResponse.data.tutor) {
          const tutorId = usersResponse.data.tutor;
          const tutorData = tutors.find(t => t._id === tutorId);
          setClassTutor(tutorData || null);
        } else {
          setClassTutor(null);
        }
        toast.success(`Đã tải thông tin lớp học ${selectedClass?.class_name || ''}`);
      }
    } catch (err) {
      handleApiError(err, 'Failed to fetch class details');
    } finally {
      setFetchingClassDetails(false);
    }
  }, [tutors, handleApiError, toast, selectedClass]);
  
  // Handle selecting a class
  const handleSelectClass = useCallback((classItem) => {
    setSelectedClass(classItem);
    fetchClassDetails(classItem._id);
    toast.info(`Đã chọn lớp ${classItem.class_name}`);
  }, [fetchClassDetails, toast]);
  
  // Filter classes based on search query
  const filteredClasses = useMemo(() => {
    if (!classSearchQuery.trim()) return classes;
    
    return classes.filter(cls => 
      cls.class_name.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
      cls.subject.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
      cls.major.toLowerCase().includes(classSearchQuery.toLowerCase())
    );
  }, [classes, classSearchQuery]);
  
  // Hàm để lấy sinh viên theo major khi mở modal thêm sinh viên
  const fetchStudentsByMajor = useCallback(async (majorName) => {
    if (!majorName) return;
    
    setLoadingMajorStudents(true);
    try {
      const response = await api.get(`/api/assign-student/search-students-by-major?major=${majorName}`);
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

  // Cập nhật logic khi mở modal thêm sinh viên
  const handleOpenAddStudentModal = useCallback(() => {
    if (selectedClass && selectedClass.major) {
      fetchStudentsByMajor(selectedClass.major);
      setIsAddStudentModalOpen(true);
    }
  }, [selectedClass, fetchStudentsByMajor]);

  // Filter available students từ majorStudents thay vì allStudents
  const availableStudents = useMemo(() => {
    if (!selectedClass || !majorStudents.length) return [];
    
    // Filter out students already in the class
    const classStudentIds = classStudents.map(s => s._id);
    const availableStudents = majorStudents.filter(s => !classStudentIds.includes(s._id));
    
    // Filter by search query if provided
    if (studentSearchQuery.trim()) {
      return availableStudents.filter(student => 
        student.firstName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        (student.student_ID && student.student_ID.toLowerCase().includes(studentSearchQuery.toLowerCase()))
      );
    }
    
    return availableStudents;
  }, [majorStudents, classStudents, selectedClass, studentSearchQuery]);
  
  // Update class tutor
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
      
      // Refresh class list and details
      await fetchClasses();
      await fetchClassDetails(selectedClass._id);
      
      // Close modal
      setIsEditTutorModalOpen(false);
    } catch (err) {
      handleApiError(err, 'Failed to update tutor');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, fetchClasses, fetchClassDetails, handleApiError]);
  
  // Add students to class
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
      
      // Refresh class details
      await fetchClassDetails(selectedClass._id);
      
      // Close modal
      setIsAddStudentModalOpen(false);
    } catch (err) {
      handleApiError(err, 'Failed to add students');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, fetchClassDetails]);
  
  // Remove student from class
  const handleRemoveStudent = useCallback((student) => {
    setStudentToRemove(student);
    setIsRemoveStudentModalOpen(true);
  }, []);
  
  // Confirm remove student
  const confirmRemoveStudent = useCallback(async () => {
    if (!selectedClass || !studentToRemove) return;
    
    // Lưu trữ học sinh trước khi xóa để có thể hoàn tác
    const studentId = studentToRemove._id;
    const studentName = `${studentToRemove.firstName} ${studentToRemove.lastName}`;
    
    // Optimistic update - cập nhật UI ngay lập tức
    setClassStudents(prev => prev.filter(s => s._id !== studentId));
    setIsRemoveStudentModalOpen(false);
    setStudentToRemove(null);
    
    // Hiển thị thông báo đang xử lý
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
      
      // Không cần phải gọi lại fetchClassDetails, vì đã cập nhật UI
    } catch (err) {
      // Hoàn tác UI change nếu API call thất bại
      setClassStudents(prev => [...prev, studentToRemove]);
      handleApiError(err, `Failed to remove ${studentName}`);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, studentToRemove]);
  
  const handleStudentSelect = (studentId) => {
    setSelectedStudentIds(prev => {
      // Nếu sinh viên đã được chọn, loại bỏ khỏi danh sách
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } 
      // Nếu chưa được chọn, thêm vào danh sách
      else {
        return [...prev, studentId];
      }
    });
  };
  
  // Render class list sidebar
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
  
  // Render class details section
  const renderClassDetails = () => {
    if (!selectedClass) {
      return (
        <div className="class-management-content empty-state">
          <p>Select a class to view and manage its details</p>
        </div>
      );
    }
    
    return (
      <div className="class-management-content">
        <div className="class-header">
          <h2>{selectedClass.class_name}</h2>
          <div className="class-info">
            <span className="badge major">{selectedClass.major}</span>
            <span className="badge subject">{selectedClass.subject}</span>
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
                    <h4>{classTutor.firstName} {classTutor.lastName}</h4>
                    <p>{classTutor.email}</p>
                  </div>
                </div>
              ) : (
                <p className="no-data">No tutor assigned</p>
              )}
            </div>
            
            <div className="section students-section">
              <div className="section-header">
                <h3>Students ({classStudents.length})</h3>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={handleOpenAddStudentModal}
                >
                  Add Students
                </Button>
              </div>
              
              {classStudents.length === 0 ? (
                <p className="no-data">No students assigned to this class</p>
              ) : (
                <div className="students-list">
                  {classStudents.map(student => (
                    <div key={student._id} className="student-card">
                      <div className="student-info">
                        <h4>{student.firstName} {student.lastName}</h4>
                        <p>{student.student_ID || 'No ID'}</p>
                      </div>
                      <Button 
                        variant="danger" 
                        size="small"
                        onClick={() => handleRemoveStudent(student)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };
  
  // Edit Tutor Modal
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
  
  // Add Students Modal
  const renderAddStudentModal = () => {
    return (
      <Modal 
        isOpen={isAddStudentModalOpen} 
        onClose={() => {
          setIsAddStudentModalOpen(false);
          setSelectedStudentIds([]); // Reset khi đóng modal
        }}
        title={`Add Students: ${selectedClass?.class_name}`}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (selectedStudentIds.length > 0) {
            handleAddStudents(selectedStudentIds);
            setSelectedStudentIds([]); // Reset sau khi submit
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
  
  // Remove Student Confirmation Modal
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
  
  // Main render
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