import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import api from '../../utils/api';
import './AssignClass.css';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import Modal from '../../components/modal/Modal';

const CreateClassForm = memo(({ onSubmit, loading }) => {
  const [className, setClassName] = useState('');
  const [major, setMajor] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit({ className, major, subject });
    // Reset form after submit
    setClassName('');
    setMajor('');
    setSubject('');
  }, [className, major, subject, onSubmit]);

  return (
    <div className="create-class-form">
      <h3>Create New Class</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <InputField 
            label="Class Name*"
            value={className} 
            onChange={(e) => setClassName(e.target.value)}
            required
            fullWidth
          />
        </div>
        
        <div className="form-group">
          <InputField 
            label="Major*"
            value={major} 
            onChange={(e) => setMajor(e.target.value)}
            required
            fullWidth
          />
        </div>
        
        <div className="form-group">
          <InputField 
            label="Subject*"
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            required
            fullWidth
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={loading}
          variant="primary"
          fullWidth
        >
          {loading ? 'Creating...' : 'Create Class'}
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
                  e.stopPropagation(); // Prevent row click
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

const AssignTutorForm = memo(({ tutors, selectedClass, onSubmit, loading }) => {
  const [selectedTutor, setSelectedTutor] = useState('');
  
  console.log('Tutors in form:', tutors); 
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('Selected tutor ID:', selectedTutor); 
    onSubmit(selectedTutor);
    setSelectedTutor('');
  }, [selectedTutor, onSubmit]);

  return (
    <div className="assign-form">
      <h3>Assign Tutor to Class</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Tutor: {tutors.length > 0 ? `(${tutors.length} tutors available)` : '(No tutors found)'}</label>
          <select 
            value={selectedTutor} 
            onChange={(e) => setSelectedTutor(e.target.value)}
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
        
        <Button 
          type="submit" 
          disabled={loading || !selectedTutor} 
          variant="primary"
        >
          {loading ? 'Assigning...' : 'Assign Tutor'}
        </Button>
      </form>
    </div>
  );
});

const AssignStudentsForm = memo(({ 
  students, 
  selectedClass, 
  onSingleAssign, 
  onMultipleAssign, 
  loading 
}) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    
    return students.filter(student => 
      student.student_ID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      return;
    }
    
    if (selectedStudents.length === 1) {
      onSingleAssign(selectedStudents[0]);
    } else {
      onMultipleAssign(selectedStudents);
    }
    
    setSelectedStudents([]);
  }, [selectedStudents, onSingleAssign, onMultipleAssign]);

  const handleStudentSelect = useCallback((e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedStudents(value);
  }, []);
  
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div className="assign-form student-assignment-form">
      <h3>Assign Students</h3>
      
      {/* Search Input */}
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
              >
                ×
              </button>
            )
          }
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Students (hold Ctrl/Cmd to select multiple):</label>
          <select 
            multiple
            value={selectedStudents}
            onChange={handleStudentSelect}
            required
            className="multiple-select"
            size={8}
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
              <small>Select one or more students to assign to this class</small>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading || selectedStudents.length === 0}
          variant={selectedStudents.length > 0 ? "primary" : "outline"}
          fullWidth
        >
          {loading ? 'Assigning...' : `Assign ${selectedStudents.length} Student(s)`}
        </Button>
      </form>
    </div>
  );
});

const ClassDetailModal = memo(({ isOpen, onClose, classData, onDeleteTutor, onDeleteStudent, loading }) => {
  const [classTutors, setClassTutors] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && classData) {
      setDataLoading(true);
      Promise.all([
        api.get(`/api/assign/get-tutors/${classData._id}`),
        api.get(`/api/assign/get-students/${classData._id}`)
      ]).then(([tutorsResponse, studentsResponse]) => {
        setClassTutors(tutorsResponse.data || []);
        setClassStudents(studentsResponse.data || []);
      }).catch(err => {
        console.error('Error fetching class details:', err);
      }).finally(() => {
        setDataLoading(false);
      });
    }
  }, [isOpen, classData]);
  
  if (!classData) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Class Details: ${classData.class_name}`}>
      {dataLoading ? (
        <div className="loading-container">
          <Loader />
        </div>
      ) : (
        <div className="class-details">
          <div className="class-info">
            <h3>Class Information</h3>
            <p><strong>Name:</strong> {classData.class_name}</p>
            <p><strong>Major:</strong> {classData.major}</p>
            <p><strong>Subject:</strong> {classData.subject}</p>
          </div>
          
          <div className="class-tutors">
            <h3>Assigned Tutors</h3>
            {classTutors.length === 0 ? (
              <p>No tutors assigned to this class</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classTutors.map(tutorAssignment => (
                    <tr key={tutorAssignment._id}>
                      <td>
                        {tutorAssignment.tutor?.firstName} {tutorAssignment.tutor?.lastName}
                      </td>
                      <td>{tutorAssignment.tutor?.email}</td>
                      <td>
                        <Button 
                          onClick={() => onDeleteTutor(tutorAssignment._id)}
                          variant="danger"
                          size="small"
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="class-students">
            <h3>Assigned Students</h3>
            {classStudents.length === 0 ? (
              <p>No students assigned to this class</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map(studentAssignment => (
                    <tr key={studentAssignment._id}>
                      <td>
                        {studentAssignment.student_id?.firstName} {studentAssignment.student_id?.lastName}
                      </td>
                      <td>{studentAssignment.student_id?.student_ID || 'N/A'}</td>
                      <td>{studentAssignment.student_id?.email}</td>
                      <td>
                        <Button 
                          onClick={() => onDeleteStudent(studentAssignment._id)}
                          variant="danger"
                          size="small"
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
});

const AssignClass = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get('/api/class/get-all-class');
      console.log('Classes response:', response.data);

      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else if (response.data && Array.isArray(response.data.classes)) {
        setClasses(response.data.classes);
      } else if (response.data && typeof response.data === 'object') {
        console.log('Classes data structure:', response.data);
        const possibleClassesData = response.data.data || response.data.results || response.data.items || [];
        setClasses(possibleClassesData);
      } else {
        console.error('Unexpected classes data format:', response.data);
        setClasses([]);
      }
      return response;
    } catch (err) {
      setError('Failed to fetch classes');
      console.error('Error fetching classes:', err);
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
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
      return err;
    }
  }, []);

  const fetchTutors = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/get-users');
      const tutorsList = response.data.users.filter(user => user.role === 'Tutor');
      console.log('Tutors fetched:', tutorsList);
      setTutors(tutorsList);
      return response;
    } catch (err) {
      setError('Failed to fetch tutors');
      console.error('Error fetching tutors:', err);
      return err;
    }
  }, []);

  useEffect(() => {
    setDataLoading(true);
    Promise.all([fetchClasses(), fetchStudents(), fetchTutors()])
      .finally(() => {
        setDataLoading(false);
      });
  }, [fetchClasses, fetchStudents, fetchTutors]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  }, []);

  const handleClassChange = useCallback((e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
  }, []);

  const handleCreateClass = useCallback(async (formData) => {
    if (!formData.className || !formData.major || !formData.subject) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/class/create-class', {
        class_name: formData.className,
        major: formData.major,
        subject: formData.subject
      });
      
      setSuccess('Class created successfully');
      fetchClasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
      console.error('Error creating class:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchClasses]);

  const handleAssignTutor = useCallback(async (tutorId) => {
    if (!selectedClass || !tutorId) {
      setError('Please select a class and a tutor');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      console.log('Sending tutor assignment:', {
        tutorIds: [tutorId], 
        classId: selectedClass,
        adminId: userData.id
      });
      
      await api.post('/api/assign/assign-tutor', {
        tutorIds: [tutorId], 
        classId: selectedClass,
        adminId: userData.id
      });
      
      setSuccess('Successfully assigned tutor to class');
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to assign tutor to class';
      
      if (errorMessage === 'Danh sách giảng viên không được để trống!') {
        errorMessage = 'Tutor list cannot be empty!';
      } else if (errorMessage === 'Class không tồn tại!') {
        errorMessage = 'Class does not exist!';
      } else if (errorMessage === 'Không có giảng viên hợp lệ để gán vào lớp!') {
        errorMessage = 'No valid tutors to assign to class!';
      } else if (errorMessage === 'Tất cả giảng viên đã được gán vào lớp trước đó!') {
        errorMessage = 'All tutors have already been assigned to this class!';
      }
      
      setError(errorMessage);
      console.error('Error assigning tutor:', err.response?.data?.message, err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  const handleSingleAssign = useCallback(async (studentId) => {
    if (!selectedClass || !studentId) {
      setError('Please select one class and one student');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      await api.post('/api/assign/assign-student', {
        assignedBy: userData.id,
        classId: selectedClass,
        studentId: studentId
      });
      
      setSuccess('Successfully assigned student to class');
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to assign student to class';
      
      if (errorMessage.includes('đã được gán vào lớp')) {
        errorMessage = 'This student has already been assigned to this class';
      } else if (errorMessage.includes('Sinh viên không tồn tại')) {
        errorMessage = 'Student does not exist';
      } else if (errorMessage.includes('Class không tồn tại')) {
        errorMessage = 'Class does not exist';
      }
      
      setError(errorMessage);
      console.error('Error assigning student:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  const handleMultipleAssign = useCallback(async (studentIds) => {
    if (!selectedClass || !studentIds.length) {
      setError('Please select one class and at least one student');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      await api.put('/api/assign/update-assign', {
        adminId: userData.id,
        classId: selectedClass,
        addStudents: studentIds,
        removeStudents: []
      });
      
      setSuccess(`Successfully assigned ${studentIds.length} students to class`);
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to assign students to class';
      
      if (errorMessage.includes('Class không tồn tại')) {
        errorMessage = 'Class does not exist';
      } else if (errorMessage.includes('Thiếu thông tin')) {
        errorMessage = 'Missing required information';
      } else if (errorMessage.includes('không hợp lệ')) {
        errorMessage = 'Some students are not valid';
      }
      
      setError(errorMessage);
      console.error('Error assigning multiple students:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  const handleDeleteAssignment = useCallback(async (assignmentId) => {
    try {
      await api.delete('/api/assign/remove', { 
        data: { 
          assignmentId: assignmentId 
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
        if (err.response.data.message.includes('Sinh viên này không tồn tại trong lớp')) {
          errorMessage = 'This student is not assigned to this class';
        }
      }
      
      setError(errorMessage);
      console.error('Error removing assignment:', err);
    }
  }, [isDetailModalOpen, selectedClassDetail]);

  const handleDeleteClass = useCallback(async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class? All assignments will be deleted too.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.delete(`/api/class/delete/${classId}`);
      setSuccess('Class deleted successfully');
      fetchClasses();
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to delete class';
      setError(errorMessage);
      console.error('Error deleting class:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchClasses]);
  
  const handleClassClick = useCallback((classData) => {
    setSelectedClassDetail(classData);
    setIsDetailModalOpen(true);
  }, []);
  
  const handleDeleteTutorFromClass = useCallback(async (assignmentId) => {
    setLoading(true);
    try {
      await api.delete('/api/assign/remove-tutor', { 
        data: { assignmentId }
      });
      
      setSuccess('Successfully removed tutor from class');
      
      if (selectedClassDetail) {
        setIsDetailModalOpen(false);
        setTimeout(() => {
          setIsDetailModalOpen(true);
        }, 100);
      }
    } catch (err) {
      let errorMessage = 'Failed to remove tutor from class';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedClassDetail]);

  const isDataLoaded = !dataLoading;

  const renderClassesTab = useCallback(() => (
    <div className="classes-tab">
      <CreateClassForm onSubmit={handleCreateClass} loading={loading} />

      <div className="classes-list">
        <h3>Available Classes</h3>
        <ClassesList 
          classes={classes} 
          onClassClick={handleClassClick}
          onDeleteClass={handleDeleteClass}
        />
      </div>
      
      <ClassDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        classData={selectedClassDetail}
        onDeleteTutor={handleDeleteTutorFromClass}
        onDeleteStudent={handleDeleteAssignment}
        loading={loading}
      />
    </div>
  ), [
    classes, 
    loading, 
    handleCreateClass, 
    handleClassClick, 
    handleDeleteClass, 
    isDetailModalOpen, 
    selectedClassDetail, 
    handleDeleteTutorFromClass, 
    handleDeleteAssignment
  ]);

  const renderAssignmentsTab = useCallback(() => (
    <div className="assignments-tab">
      {/* Class Selection */}
      <div className="class-selection">
        <h3>Select Class</h3>
        <div className="form-group">
          <select 
            value={selectedClass} 
            onChange={handleClassChange}
          >
            <option value="">Choose a class...</option>
            {classes.map(classItem => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.class_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Forms */}
      {selectedClass && (
        <div className="assign-forms-container">
          <AssignTutorForm 
            tutors={tutors} 
            selectedClass={selectedClass} 
            onSubmit={handleAssignTutor} 
            loading={loading} 
          />

          <AssignStudentsForm 
            students={students} 
            selectedClass={selectedClass} 
            onSingleAssign={handleSingleAssign} 
            onMultipleAssign={handleMultipleAssign} 
            loading={loading} 
          />
        </div>
      )}
    </div>
  ), [
    classes, students, tutors, selectedClass, loading,
    handleClassChange, handleAssignTutor, handleSingleAssign, 
    handleMultipleAssign
  ]);

  return (
    <div className="assign-class-container">
      <div className="tab-navigation">
        <Button 
          className={activeTab === 'classes' ? 'active' : ''}
          onClick={() => handleTabChange('classes')}
          variant={activeTab === 'classes' ? 'primary' : 'secondary'}
        >
          Manage Classes
        </Button>
        <Button 
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => handleTabChange('assignments')}
          variant={activeTab === 'assignments' ? 'primary' : 'secondary'}
        >
          Assign to Classes
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!isDataLoaded ? (
        <div className="loading-container">
          <Loader />
        </div>
      ) : (
        <div className="tab-content">
          {activeTab === 'classes' ? renderClassesTab() : renderAssignmentsTab()}
        </div>
      )}
    </div>
  );
};

export default AssignClass;