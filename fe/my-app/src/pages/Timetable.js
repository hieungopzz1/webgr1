import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../utils/api";
import { getUserData, isAuthenticated } from "../utils/storage";
import InputField from "../components/inputField/InputField";
import Button from "../components/button/Button";
import Loader from "../components/loader/Loader";
import Modal from "../components/modal/Modal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { useNotification } from "../context/NotificationContext";
import "./Timetable.css";

const Timetable = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({ presentStudents: [], absentStudents: [] });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [studentAttendances, setStudentAttendances] = useState([]);

  const [classFilter, setClassFilter] = useState("");
  const [slotFilter, setSlotFilter] = useState("");
  const [tutorClasses, setTutorClasses] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [tutorFilter, setTutorFilter] = useState("");

  // Initialize the notification hook
  const { success: showSuccess, error: showError } = useNotification();
  
  // Create ref for notification functions to avoid dependency cycles
  const notificationRef = useRef();
  notificationRef.current = { showSuccess, showError };

  // Thêm ref cho classes
  const classesRef = useRef();
  classesRef.current = classes;
  
  // Thêm ref cho tutors
  const tutorsRef = useRef();
  tutorsRef.current = tutors;

  // Define slot labels for easy reference
  const slotLabels = {
    1: "07:00 - 08:30",
    2: "08:45 - 10:15", 
    3: "10:30 - 12:00",
    4: "13:00 - 14:30",
    5: "14:45 - 16:15",
    6: "16:30 - 18:00"
  };

  // Lọc ra danh sách tutors đã được chia lịch
  const scheduledTutors = useMemo(() => {
    // Tạo Set để lưu trữ unique tutor IDs
    const tutorIds = new Set();
    
    // Lặp qua tất cả các lịch học để lấy tutor_id
    schedules.forEach(schedule => {
      const classInfo = classes.find(c => c._id === (schedule.class._id || schedule.class));
      const tutorId = classInfo?.tutor_id || classInfo?.tutor || schedule.class.tutor_id || schedule.class.tutor;
      
      if (tutorId) {
        tutorIds.add(tutorId);
      }
    });
    
    // Lọc danh sách tutors chỉ lấy những tutor có trong lịch học
    return tutors.filter(tutor => tutorIds.has(tutor._id));
  }, [schedules, classes, tutors]);

  useEffect(() => {
    if (isAuthenticated()) {
      const userData = getUserData();
      setUser(userData);
    }
  }, []);

  const handleApiError = useCallback((err, defaultMessage) => {
    let errorMsg = defaultMessage || "An error occurred";
    
    if (err.response) {
      if (err.response.data?.message) {
        errorMsg = err.response.data.message;
        
        // Special handling for class scheduling conflicts
        if (err.response.data.message === "Some classes are already scheduled in this slot" && 
            err.response.data.classesAlreadyScheduled) {
          // Get class names from the class IDs if possible - using classesRef instead of classes
          const classIds = err.response.data.classesAlreadyScheduled;
          const classNames = classIds.map(id => {
            const classInfo = classesRef.current.find(c => c._id === id);
            return classInfo ? classInfo.class_name : id;
          });
          
          if (classNames.length > 0) {
            errorMsg += `: ${classNames.join(', ')}`;
          }
        }
        
        // Special handling for classes with no students
        if (err.response.data.message === "Some classes have no students assigned and cannot be scheduled" && 
            err.response.data.classWithNoStudents) {
          const classIds = err.response.data.classWithNoStudents;
          const classNames = classIds.map(id => {
            const classInfo = classesRef.current.find(c => c._id === id);
            return classInfo ? classInfo.class_name : id;
          });
          
          if (classNames.length > 0) {
            errorMsg += `: ${classNames.join(', ')}`;
          }
        }
      } else if (err.response.status === 404) {
        errorMsg = "API endpoint not found";
      } else if (err.response.status === 401) {
        errorMsg = "Authentication required. Please log in again.";
      } else if (err.response.status === 403) {
        errorMsg = "You do not have permission to perform this action";
      } else if (err.response.status === 500) {
        errorMsg = "Server error occurred. Please try again later.";
      }
    } else if (err.request) {
      errorMsg = "No response received from server";
    } else {
      errorMsg = `Error: ${err.message}`;
    }
    
    setError(errorMsg);
    notificationRef.current.showError(errorMsg);
    return errorMsg;
  }, []); // Loại bỏ classes khỏi dependency array

  const fetchSchedulesForAdmin = useCallback(async () => {
    try {
      setDataLoading(true);
      const response = await api.get("/api/schedule/get-all-schedule");
      if (Array.isArray(response.data)) {
        setSchedules(response.data);
      } else {
        setSchedules([]);
      }
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch schedules");
      return err;
    } finally {
      setDataLoading(false);
    }
  }, [handleApiError]);

  const fetchSchedulesForStudent = useCallback(async () => {
    try {
      setDataLoading(true);
      const response = await api.get("/api/schedule/schedule-student");
      if (Array.isArray(response.data?.schedules)) {
        setSchedules(response.data.schedules);
      } else {
        setSchedules([]);
      }
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch your schedules");
      return err;
    } finally {
      setDataLoading(false);
    }
  }, [handleApiError]);

  const fetchSchedulesForTutor = useCallback(async () => {
    try {
      setDataLoading(true);
      const response = await api.get("/api/schedule/schedule-tutor");
      if (Array.isArray(response.data?.schedules)) {
        const scheduleData = response.data.schedules;
        setSchedules(scheduleData);
        
        if (scheduleData.length > 0) {
          const uniqueClasses = [];
          const classIds = new Set();
          
          scheduleData.forEach(schedule => {
            const classId = schedule.class._id || schedule.class;
            const className = schedule.class.class_name || "Unknown Class";
            
            if (!classIds.has(classId)) {
              classIds.add(classId);
              uniqueClasses.push({
                _id: classId,
                class_name: className
              });
            }
          });
          
          setTutorClasses(uniqueClasses);
        }
      } else {
        setSchedules([]);
        setTutorClasses([]);
      }
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch your schedules");
      return err;
    } finally {
      setDataLoading(false);
    }
  }, [handleApiError]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get("/api/class/get-all-class");
      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else {
        setClasses([]);
      }
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch classes");
      return err;
    }
  }, [handleApiError]);

  // Thêm hàm fetchTutors giống như trong AssignClass.js
  const fetchTutors = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/get-users');
      const tutorsList = response.data.users.filter(user => user.role === 'Tutor');
      setTutors(tutorsList);
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch tutors");
      return err;
    }
  }, [handleApiError]);

  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Authentication required. Please log in again.");
      return;
    }

    const userData = getUserData();
    if (!userData) return;

    if (userData.role === "Admin") {
      Promise.all([
        fetchSchedulesForAdmin(),
        fetchClasses(),
        fetchTutors()
      ]).finally(() => {
        setDataLoading(false);
      });
    } else if (userData.role === "Student") {
      fetchSchedulesForStudent();
    } else if (userData.role === "Tutor") {
      Promise.all([
        fetchSchedulesForTutor(),
        fetchTutors()
      ]).finally(() => {
        setDataLoading(false);
      });
    }
  }, [fetchSchedulesForAdmin, fetchSchedulesForStudent, fetchSchedulesForTutor, fetchClasses, fetchTutors]);

  const fetchStudentsBySchedule = useCallback(async (scheduleId) => {
    try {
      setAttendanceLoading(true);
      const response = await api.get(`/api/attendance/${scheduleId}/students`);
      if (Array.isArray(response.data?.students)) {
        setStudentsInClass(response.data.students);
      } else {
        setStudentsInClass([]);
      }
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch students for this schedule");
      return err;
    } finally {
      setAttendanceLoading(false);
    }
  }, [handleApiError]);

  const fetchAttendanceStatus = useCallback(async (scheduleId) => {
    try {
      setAttendanceLoading(true);
      const response = await api.get(`/api/attendance/${scheduleId}/status`);
      if (response.data) {
        setAttendanceStatus({
          presentStudents: response.data.presentStudents || [],
          absentStudents: response.data.absentStudents || []
        });
      }
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch attendance status");
      return err;
    } finally {
      setAttendanceLoading(false);
    }
  }, [handleApiError]);

  const submitAttendance = useCallback(async (scheduleId, attendanceData) => {
    try {
      setLoading(true);
      setError("");
      
      const payload = {
        scheduleId,
        students: attendanceData
      };
      
      const response = await api.post('/api/attendance/mark', payload);
      const successMessage = "Attendance marked successfully!";
      setSuccess(successMessage);
      notificationRef.current.showSuccess(successMessage);
      setIsAttendanceModalOpen(false);
      return response;
    } catch (err) {
      handleApiError(err, "Failed to mark attendance");
      return err;
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const handleOpenAttendanceModal = useCallback(async (schedule) => {
    setSelectedSchedule(schedule);
    try {
      await fetchStudentsBySchedule(schedule._id);
      await fetchAttendanceStatus(schedule._id);
      setIsAttendanceModalOpen(true);
    } catch (error) {
      console.error("Error opening attendance modal:", error);
    }
  }, [fetchStudentsBySchedule, fetchAttendanceStatus]);

  const handleCreateSchedule = useCallback(async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.post("/api/schedule/create-schedule", formData);
      const successMessage = "Schedule created successfully!";
      setSuccess(successMessage);
      notificationRef.current.showSuccess(successMessage);
      setIsCreateModalOpen(false);
      fetchSchedulesForAdmin();
      return response;
    } catch (err) {
      handleApiError(err, "Failed to create schedule");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedulesForAdmin, handleApiError]);

  const handleUpdateSchedule = useCallback(async (scheduleId, formData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.put(`/api/schedule/update-schedule/${scheduleId}`, formData);
      const successMessage = "Schedule updated successfully!";
      setSuccess(successMessage);
      notificationRef.current.showSuccess(successMessage);
      setIsEditModalOpen(false);
      fetchSchedulesForAdmin();
      return response;
    } catch (err) {
      handleApiError(err, "Failed to update schedule");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedulesForAdmin, handleApiError]);

  const handleDeleteSchedule = useCallback(async (scheduleId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.delete(`/api/schedule/delete-schedule/${scheduleId}`);
      const successMessage = "Schedule deleted successfully!";
      setSuccess(successMessage);
      notificationRef.current.showSuccess(successMessage);
      setIsDeleteModalOpen(false);
      fetchSchedulesForAdmin();
      return response;
    } catch (err) {
      handleApiError(err, "Failed to delete schedule");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedulesForAdmin, handleApiError]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredSchedules = schedules.filter(schedule => {
    let matchesClass = true;
    let matchesDate = true;
    let matchesTutor = true;
    
    if (classFilter) {
      matchesClass = schedule.class._id === classFilter || schedule.class === classFilter;
    }
    
    if (dateFilter) {
      const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
      matchesDate = scheduleDate === dateFilter;
    }
    
    if (tutorFilter) {
      const classInfo = classes.find(c => c._id === (schedule.class._id || schedule.class));
      const tutorId = classInfo?.tutor_id || classInfo?.tutor || schedule.class.tutor_id || schedule.class.tutor;
      matchesTutor = tutorId === tutorFilter;
    }
    
    return matchesClass && matchesDate && matchesTutor;
  });

  const getStudentAttendanceStatus = useCallback((studentId) => {
    const isPresentStudent = attendanceStatus.presentStudents.some(student => student._id === studentId);
    if (isPresentStudent) return "Present";
    
    const isAbsentStudent = attendanceStatus.absentStudents.some(student => student._id === studentId);
    if (isAbsentStudent) return "Absent";
    
    return null;
  }, [attendanceStatus]);

  const AttendanceModal = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    
    useEffect(() => {
      if (isAttendanceModalOpen && studentsInClass.length > 0) {
        const initialAttendance = studentsInClass.map(student => {
          const status = getStudentAttendanceStatus(student._id);
          return {
            studentId: student._id,
            status: status || "Absent"
          };
        });
        setAttendanceData(initialAttendance);
      }
    }, [isAttendanceModalOpen, studentsInClass]);
    
    const handleStatusChange = (studentId, status) => {
      setAttendanceData(prev => 
        prev.map(item => 
          item.studentId === studentId ? { ...item, status } : item
        )
      );
    };
    
    const handleSubmit = () => {
      if (!selectedSchedule || !attendanceData.length) return;
      submitAttendance(selectedSchedule._id, attendanceData);
    };
    
    return (
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title="Mark Attendance"
      >
        {attendanceLoading ? (
          <div className="attendance-loading">
            <Loader />
            <p>Loading students...</p>
          </div>
        ) : (
          <div className="attendance-container">
            <div className="attendance-header">
              <p>
                <strong>Class:</strong> {selectedSchedule?.class?.class_name}
              </p>
              <p>
                <strong>Date:</strong> {selectedSchedule && formatDate(selectedSchedule.date)}
              </p>
              <p>
                <strong>Slot:</strong> {selectedSchedule?.slot && slotLabels[selectedSchedule.slot]}
              </p>
            </div>
            
            {studentsInClass.length === 0 ? (
              <div className="no-students">
                <p>No students assigned to this class.</p>
              </div>
            ) : (
              <>
                <div className="attendance-list">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsInClass.map(student => (
                        <tr key={student._id}>
                          <td>{student.firstName} {student.lastName}</td>
                          <td>
                            <div className="attendance-radio-group">
                              <label className="attendance-radio">
                                <input
                                  type="radio"
                                  name={`attendance-${student._id}`}
                                  checked={attendanceData.find(item => item.studentId === student._id)?.status === "Present"}
                                  onChange={() => handleStatusChange(student._id, "Present")}
                                />
                                <span className="present-label">Present</span>
                              </label>
                              <label className="attendance-radio">
                                <input
                                  type="radio"
                                  name={`attendance-${student._id}`}
                                  checked={attendanceData.find(item => item.studentId === student._id)?.status === "Absent"}
                                  onChange={() => handleStatusChange(student._id, "Absent")}
                                />
                                <span className="absent-label">Absent</span>
                              </label>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="attendance-actions">
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Attendance"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    );
  };

  const ScheduleForm = ({ onSubmit, initialData = {}, submitLabel }) => {
    const today = new Date().toISOString().split('T')[0];
    
    const [formData, setFormData] = useState({
      date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : today,
      classId: initialData.classId || "",
      selectedSlots: initialData.selectedSlots || []
    });
    
    const [errors, setErrors] = useState({});
    
    const handleDateChange = (value) => {
      setFormData(prev => ({
        ...prev,
        date: value
      }));
      setSelectedDate(value);
      
      if (value && errors.date) {
        setErrors(prev => ({ ...prev, date: undefined }));
      }
    };
    
    const handleClassChange = (value) => {
      setFormData(prev => ({
        ...prev,
        classId: value,
        // Reset selected slots when class changes
        selectedSlots: []
      }));
      
      if (value && errors.classId) {
        setErrors(prev => ({ ...prev, classId: undefined }));
      }
    };
    
    const handleSlotToggle = (slotNumber) => {
      setFormData(prev => {
        const isSelected = prev.selectedSlots.includes(slotNumber);
        let newSelectedSlots;
        
        if (isSelected) {
          // Remove slot if already selected
          newSelectedSlots = prev.selectedSlots.filter(slot => slot !== slotNumber);
        } else {
          // Add slot if not selected
          newSelectedSlots = [...prev.selectedSlots, slotNumber];
        }
        
        return {
          ...prev,
          selectedSlots: newSelectedSlots
        };
      });
      
      if (formData.selectedSlots.length > 0 && errors.selectedSlots) {
        setErrors(prev => ({ ...prev, selectedSlots: undefined }));
      }
    };
    
    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.date) {
        newErrors.date = "Date is required";
      }
      
      if (!formData.classId) {
        newErrors.classId = "Please select a class";
      }
      
      if (formData.selectedSlots.length === 0) {
        newErrors.selectedSlots = "Please select at least one time slot";
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (validateForm()) {
        // Prepare data for API submission - format to match backend expectations
        const submissionData = {
          date: formData.date,
          slots: formData.selectedSlots.map(slotNumber => ({
            slot: slotNumber,
            classes: [formData.classId]
          }))
        };
        
        onSubmit(submissionData);
      }
    };
    
    // Đã chọn lớp học và ngày chưa
    const isInitialSelectionComplete = formData.classId && formData.date;
    
    return (
      <form onSubmit={handleSubmit} className="schedule-form">
        <div className="form-row">
          <div className="form-group">
            <InputField
              label="Date*"
              type="date"
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={today}
              required
              fullWidth
              error={errors.date}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="classId" className={errors.classId ? "error-label" : ""}>Class*</label>
            <select
              id="classId"
              value={formData.classId}
              onChange={(e) => handleClassChange(e.target.value)}
              required
              className={`form-select ${errors.classId ? "error-input" : ""}`}
            >
              <option value="">Select a class...</option>
              {classes.map(classItem => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.class_name} - {classItem.subject} ({classItem.major})
                </option>
              ))}
            </select>
            {errors.classId && <div className="error-message">{errors.classId}</div>}
          </div>
        </div>
        
        {isInitialSelectionComplete && (
          <div className="slots-selection-container">
            <h3>Select Time Slots</h3>
            {errors.selectedSlots && <div className="error-message">{errors.selectedSlots}</div>}
            
            <div className="slots-checkbox-list">
              {Object.entries(slotLabels).map(([slot, timeRange]) => (
                <div key={slot} className="slot-checkbox-item">
                  <input
                    type="checkbox"
                    id={`slot-${slot}`}
                    checked={formData.selectedSlots.includes(parseInt(slot))}
                    onChange={() => handleSlotToggle(parseInt(slot))}
                  />
                  <label htmlFor={`slot-${slot}`}>
                    <span className="slot-number">Slot {slot}:</span> {timeRange}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="selection-info">
              {formData.selectedSlots.length > 0 && (
                <small>Selected: {formData.selectedSlots.length} slot(s)</small>
              )}
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <Button
            type="submit"
            disabled={loading || !formData.classId || formData.selectedSlots.length === 0}
            variant="primary"
          >
            {loading ? "Processing..." : submitLabel}
          </Button>
        </div>
      </form>
    );
  };

  const CreateScheduleModal = () => (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      title="Create Schedule"
      maxWidth="800px"
    >
      <ScheduleForm
        onSubmit={handleCreateSchedule}
        submitLabel="Create Schedule"
      />
    </Modal>
  );

  const EditScheduleModal = () => (
    <Modal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      title="Edit Schedule"
      maxWidth="800px"
    >
      {selectedSchedule && (
        <ScheduleForm
          initialData={{
            date: selectedSchedule.date,
            classId: selectedSchedule.class._id || selectedSchedule.class,
            selectedSlots: [selectedSchedule.slot]
          }}
          onSubmit={(formData) => handleUpdateSchedule(selectedSchedule._id, formData)}
          submitLabel="Update Schedule"
        />
      )}
    </Modal>
  );

  const DeleteScheduleModal = () => (
    <ConfirmModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={() => handleDeleteSchedule(selectedSchedule._id)}
      title="Delete Schedule"
      message="Are you sure you want to delete this schedule? This action cannot be undone."
    />
  );

  const renderFilterPanel = () => (
    <div className="filter-panel">
      <div className="filter-item">
        <label>Filter by Class</label>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="form-select"
        >
          <option value="">All Classes</option>
          {classes.map(classItem => (
            <option key={classItem._id} value={classItem._id}>
              {classItem.class_name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="filter-item">
        <label>Filter by Date</label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="form-input"
        />
      </div>
      
      <div className="filter-item">
        <label>Filter by Tutor</label>
        <select
          value={tutorFilter}
          onChange={(e) => setTutorFilter(e.target.value)}
          className="form-select"
        >
          <option value="">All Tutors</option>
          {scheduledTutors.length > 0 ? (
            scheduledTutors.map(tutor => (
              <option key={tutor._id} value={tutor._id}>
                {tutor.firstName} {tutor.lastName}
              </option>
            ))
          ) : (
            <option value="" disabled>No tutors scheduled</option>
          )}
        </select>
      </div>
      
      {(classFilter || dateFilter || tutorFilter) && (
        <button
          className="reset-filters"
          onClick={() => {
            setClassFilter("");
            setDateFilter("");
            setTutorFilter("");
          }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );

  const renderScheduleTable = (showActions = true, isTutor = false, isStudent = false) => (
    <table className="schedule-table">
      <thead>
        <tr>
          <th>Class</th>
          <th>Major</th>
          <th>Tutor Name</th>
          <th>Date</th>
          <th>Slot</th>
          {showActions && <th>Actions</th>}
          {isTutor && <th>Attendance</th>}
          {isStudent && <th>Attendance Status</th>}
        </tr>
      </thead>
      <tbody>
        {filteredSchedules.length === 0 ? (
          <tr>
            <td colSpan={showActions ? 6 : (isTutor || isStudent ? 6 : 5)} className="no-data">
              {dataLoading ? "Loading schedules..." : "No schedules found"}
            </td>
          </tr>
        ) : (
          filteredSchedules.map(schedule => {
            const classInfo = classes.find(c => c._id === (schedule.class._id || schedule.class));
            const className = classInfo ? classInfo.class_name : (schedule.class.class_name || "Unknown Class");
            const major = classInfo ? classInfo.major : (schedule.class.major || "Unknown Major");
            
            // Cách lấy tên tutor được cải thiện
            let tutorName = "Not Assigned";
            
            // Kiểm tra tutor_id trong class
            const tutorId = classInfo?.tutor_id || classInfo?.tutor || schedule.class.tutor_id || schedule.class.tutor;
            
            if (tutorId) {
              // Tìm tutor từ danh sách tutors
              const tutorInfo = tutors.find(t => t._id === tutorId);
              if (tutorInfo) {
                tutorName = `${tutorInfo.firstName} ${tutorInfo.lastName}`;
              } else if (classInfo?.tutor_name) {
                tutorName = classInfo.tutor_name;
              } else if (schedule.class.tutor_name) {
                tutorName = schedule.class.tutor_name;
              }
            } else if (classInfo?.tutor_name) {
              tutorName = classInfo.tutor_name;
            } else if (schedule.class.tutor_name) {
              tutorName = schedule.class.tutor_name;
            }
            
            return (
              <tr key={schedule._id}>
                <td>{className}</td>
                <td>{major}</td>
                <td>{tutorName}</td>
                <td>{formatDate(schedule.date)}</td>
                <td>
                  <span className="slot-badge">
                    Slot {schedule.slot}: {slotLabels[schedule.slot]}
                  </span>
                </td>
                {showActions && (
                  <td className="action-buttons">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setIsEditModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                )}
                {isTutor && (
                  <td className="attendance-cell">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleOpenAttendanceModal(schedule)}
                    >
                      Mark Attendance
                    </Button>
                  </td>
                )}
                {isStudent && (
                  <td className="attendance-status-cell">
                    <span className={`attendance-badge ${getStudentAttendanceStatus(user.id)?.toLowerCase() || 'not-marked'}`}>
                      {getStudentAttendanceStatus(user.id) || "Not Marked"}
                    </span>
                  </td>
                )}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  const renderUserScheduleView = () => {
    const isTutor = user?.role === "Tutor";
    const isStudent = user?.role === "Student";
    
    return (
      <>
        <div className="user-timetable-header">
          <h2>My Schedule</h2>
          <div className="user-filters">
            {isTutor && tutorClasses.length > 0 && (
              <div className="filter-class">
                <label>Filter by Class:</label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Classes</option>
                  {tutorClasses.map(classItem => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.class_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="filter-date">
              <label>Filter by Date:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="form-input"
              />
            </div>
            {!isTutor && (
              <div className="filter-tutor">
                <label>Filter by Tutor:</label>
                <select
                  value={tutorFilter}
                  onChange={(e) => setTutorFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Tutors</option>
                  {scheduledTutors.length > 0 ? (
                    scheduledTutors.map(tutor => (
                      <option key={tutor._id} value={tutor._id}>
                        {tutor.firstName} {tutor.lastName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No tutors scheduled</option>
                  )}
                </select>
              </div>
            )}
            {(classFilter || dateFilter || tutorFilter) && (
              <button
                className="reset-filters compact"
                onClick={() => {
                  setClassFilter("");
                  setDateFilter("");
                  setTutorFilter("");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
          
        {dataLoading ? (
          <div className="loading-container">
            <Loader />
          </div>
        ) : (
          renderScheduleTable(false, isTutor, isStudent)
        )}
        
        {isTutor && <AttendanceModal />}
      </>
    );
  };

  const renderContent = () => {
    if (!user) {
      return (
        <div className="loading-container">
          <Loader />
        </div>
      );
    }

    if (user.role === "Admin") {
      return (
        <>
          <div className="admin-controls">
            <h2>Schedule Management</h2>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create New Schedule
            </Button>
          </div>

          {renderFilterPanel()}
          
          {dataLoading ? (
            <div className="loading-container">
              <Loader />
            </div>
          ) : (
            renderScheduleTable(true)
          )}
          
          <CreateScheduleModal />
          <EditScheduleModal />
          <DeleteScheduleModal />
        </>
      );
    }

    if (user.role === "Student" || user.role === "Tutor") {
      return renderUserScheduleView();
    }

    return (
      <div className="message-container">
        <p>Timetable view for {user.role} is not available.</p>
      </div>
    );
  };

  return (
    <div className="timetable-container">
      {renderContent()}
    </div>
  );
};

export default Timetable;
