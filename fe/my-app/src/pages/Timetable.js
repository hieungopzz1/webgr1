import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { getUserData, isAuthenticated } from "../utils/storage";
import InputField from "../components/inputField/InputField";
import Button from "../components/button/Button";
import Loader from "../components/loader/Loader";
import Modal from "../components/modal/Modal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import "./Timetable.css";

const Timetable = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({ presentStudents: [], absentStudents: [] });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [studentAttendances, setStudentAttendances] = useState([]);

  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tutorClasses, setTutorClasses] = useState([]);

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
    return errorMsg;
  }, []);

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

  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Authentication required. Please log in again.");
      return;
    }

    const userData = getUserData();
    if (!userData) return;

    if (userData.role === "Admin") {
      fetchSchedulesForAdmin();
      fetchClasses();
    } else if (userData.role === "Student") {
      fetchSchedulesForStudent();
    } else if (userData.role === "Tutor") {
      fetchSchedulesForTutor();
    }
  }, [fetchSchedulesForAdmin, fetchSchedulesForStudent, fetchSchedulesForTutor, fetchClasses]);

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
      setSuccess("Attendance marked successfully!");
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
      setSuccess("Schedule created successfully!");
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
      setSuccess("Schedule updated successfully!");
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
      setSuccess("Schedule deleted successfully!");
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
    let matchesType = true;
    
    if (classFilter) {
      matchesClass = schedule.class._id === classFilter || schedule.class === classFilter;
    }
    
    if (typeFilter) {
      matchesType = schedule.type === typeFilter;
    }
    
    return matchesClass && matchesType;
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
                <strong>Time:</strong> {selectedSchedule?.startTime} - {selectedSchedule?.endTime}
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
      classId: initialData.class?._id || initialData.class || "",
      date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : today,
      startTime: initialData.startTime || "08:00",
      endTime: initialData.endTime || "09:00",
      type: initialData.type || "Offline",
      meetingLink: initialData.meetingLink || "",
    });
    
    const [errors, setErrors] = useState({});
    
    const handleChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      if (value && errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };
    
    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.classId) {
        newErrors.classId = "Class is required";
      }
      
      if (!formData.date) {
        newErrors.date = "Date is required";
      }
      
      if (!formData.startTime) {
        newErrors.startTime = "Start time is required";
      }
      
      if (!formData.endTime) {
        newErrors.endTime = "End time is required";
      }
      
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = "End time must be after start time";
      }
      
      if (!formData.type) {
        newErrors.type = "Schedule type is required";
      }
      
      if (formData.type === "Online" && !formData.meetingLink) {
        newErrors.meetingLink = "Meeting link is required for online class";
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (validateForm()) {
        onSubmit(formData);
      }
    };
    
    return (
      <form onSubmit={handleSubmit} className="schedule-form">
        <div className="form-group">
          <label htmlFor="classId" className={errors.classId ? "error-label" : ""}>Class*</label>
          <select
            id="classId"
            value={formData.classId}
            onChange={(e) => handleChange("classId", e.target.value)}
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
        
        <div className="form-row">
          <div className="form-group">
            <InputField
              label="Date*"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              min={today}
              required
              fullWidth
              error={errors.date}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="type" className={errors.type ? "error-label" : ""}>Type*</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              required
              className={`form-select ${errors.type ? "error-input" : ""}`}
            >
              <option value="Offline">Offline</option>
              <option value="Online">Online</option>
            </select>
            {errors.type && <div className="error-message">{errors.type}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <InputField
              label="Start Time*"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              required
              fullWidth
              error={errors.startTime}
            />
          </div>
          
          <div className="form-group">
            <InputField
              label="End Time*"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              required
              fullWidth
              error={errors.endTime}
            />
          </div>
        </div>
        
        {formData.type === "Online" && (
          <div className="form-group">
            <InputField
              label="Meeting Link*"
              value={formData.meetingLink}
              onChange={(e) => handleChange("meetingLink", e.target.value)}
              required
              fullWidth
              error={errors.meetingLink}
            />
          </div>
        )}
        
        <div className="form-actions">
          <Button
            type="submit"
            disabled={loading}
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
      title="Create New Schedule"
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
    >
      {selectedSchedule && (
        <ScheduleForm
          initialData={selectedSchedule}
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
        <label>Filter by Type</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="form-select"
        >
          <option value="">All Types</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>
      </div>
      
      {(classFilter || typeFilter) && (
        <button
          className="reset-filters"
          onClick={() => {
            setClassFilter("");
            setTypeFilter("");
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
          <th>Date</th>
          <th>Time</th>
          <th>Type</th>
          <th>Location/Link</th>
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
            
            return (
              <tr key={schedule._id}>
                <td>{className}</td>
                <td>{formatDate(schedule.date)}</td>
                <td>{schedule.startTime} - {schedule.endTime}</td>
                <td>
                  <span className={`type-badge ${schedule.type.toLowerCase()}`}>
                    {schedule.type}
                  </span>
                </td>
                <td>
                  {schedule.type === "Online" ? (
                    <a href={schedule.meetingLink} target="_blank" rel="noopener noreferrer" className="meeting-link">
                      Open Meeting Link
                    </a>
                  ) : (
                    schedule.location || "Not specified"
                  )}
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
            <div className="filter-type">
              <label>Filter by Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Types</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            {(classFilter || typeFilter) && (
              <button
                className="reset-filters compact"
                onClick={() => {
                  setClassFilter("");
                  setTypeFilter("");
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
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {renderContent()}
    </div>
  );
};

export default Timetable;
