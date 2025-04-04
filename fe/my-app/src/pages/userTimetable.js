import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../utils/api";
import { getUserData, isAuthenticated } from "../utils/storage";
import InputField from "../components/inputField/InputField";
import Button from "../components/button/Button";
import Loader from "../components/loader/Loader";
import Modal from "../components/modal/Modal";
import { useNotification } from "../context/NotificationContext";
import "./userTimetable.css";

const UserTimetable = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({ presentStudents: [], absentStudents: [] });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [studentAttendances, setStudentAttendances] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Lọc theo tuần và năm
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  
  const [classFilter, setClassFilter] = useState("");
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

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Hàm lấy số tuần trong năm
  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Lấy ngày đầu tuần từ tuần và năm
  function getFirstDayOfWeek(year, week) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7 - firstDayOfYear.getDay() + 1;
    return new Date(year, 0, daysOffset);
  }

  // Tạo mảng các ngày trong tuần từ ngày đầu tuần
  function getDaysOfWeek(firstDay) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDay);
      day.setDate(firstDay.getDate() + i);
      days.push(day);
    }
    return days;
  }

  // Format date to locale date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format theo định dạng DD/MM
  const formatShortDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Lấy danh sách các tuần trong năm
  const getWeeksInYear = (year) => {
    const weeks = [];
    const firstDayOfYear = new Date(year, 0, 1);
    const lastDayOfYear = new Date(year, 11, 31);
    
    const firstWeek = getWeekNumber(firstDayOfYear);
    const lastWeek = getWeekNumber(lastDayOfYear);
    
    for (let week = firstWeek; week <= lastWeek; week++) {
      const firstDay = getFirstDayOfWeek(year, week);
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);
      
      weeks.push({
        week,
        label: `${formatDate(firstDay)} - ${formatDate(lastDay)}`
      });
    }
    
    return weeks;
  };

  // Danh sách các năm để hiển thị trong dropdown
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }, []);

  // Danh sách các tuần trong năm đã chọn
  const weekOptions = useMemo(() => {
    return getWeeksInYear(selectedYear);
  }, [selectedYear]);

  // Lấy các ngày trong tuần đã chọn
  const daysInSelectedWeek = useMemo(() => {
    const firstDay = getFirstDayOfWeek(selectedYear, selectedWeek);
    return getDaysOfWeek(firstDay);
  }, [selectedYear, selectedWeek]);

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
    notificationRef.current.showError(errorMsg);
    return errorMsg;
  }, []);

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

    if (userData.role === "Student") {
      Promise.all([
        fetchSchedulesForStudent(),
        fetchTutors()
      ]).finally(() => {
        setDataLoading(false);
      });
    } else if (userData.role === "Tutor") {
      Promise.all([
        fetchSchedulesForTutor(),
        fetchTutors()
      ]).finally(() => {
        setDataLoading(false);
      });
    }
  }, [fetchSchedulesForStudent, fetchSchedulesForTutor, fetchTutors]);

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

  // Lọc lịch học theo khoảng thời gian của tuần đã chọn
  const filteredSchedulesByWeek = useMemo(() => {
    if (!daysInSelectedWeek.length) return [];
    
    const startDate = daysInSelectedWeek[0];
    const endDate = daysInSelectedWeek[6];
    endDate.setHours(23, 59, 59, 999);
    
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate >= startDate && scheduleDate <= endDate;
    });
  }, [schedules, daysInSelectedWeek]);

  // Nhóm lịch học theo ngày và slot
  const schedulesGroupedByDayAndSlot = useMemo(() => {
    const groupedSchedules = {};
    
    // Khởi tạo cấu trúc dữ liệu
    for (let slot = 1; slot <= 6; slot++) {
      groupedSchedules[slot] = {};
      daysInSelectedWeek.forEach((day, dayIndex) => {
        const dateKey = day.toISOString().split('T')[0];
        groupedSchedules[slot][dateKey] = [];
      });
    }
    
    // Phân loại lịch học
    filteredSchedulesByWeek.forEach(schedule => {
      const dateKey = new Date(schedule.date).toISOString().split('T')[0];
      const slot = schedule.slot;
      
      if (groupedSchedules[slot] && groupedSchedules[slot][dateKey]) {
        groupedSchedules[slot][dateKey].push(schedule);
      }
    });
    
    return groupedSchedules;
  }, [filteredSchedulesByWeek, daysInSelectedWeek]);

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

  // Hiển thị thông tin lớp học trong ô lịch
  const renderScheduleCell = (schedules, dayKey, isTutor, isStudent) => {
    if (!schedules || schedules.length === 0) {
      return <div className="empty-cell"></div>;
    }

    return (
      <div className="schedule-cells">
        {schedules.map(schedule => {
          const classInfo = classes.find(c => c._id === (schedule.class._id || schedule.class));
          const className = classInfo ? classInfo.class_name : (schedule.class.class_name || "Unknown Class");
          const major = classInfo ? classInfo.major : (schedule.class.major || "Unknown Major");
          
          // Cách lấy tên tutor
          let tutorName = "Not Assigned";
          const tutorId = classInfo?.tutor_id || classInfo?.tutor || schedule.class.tutor_id || schedule.class.tutor;
          
          if (tutorId) {
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

          // Xác định trạng thái điểm danh
          let attendanceStatus = '';
          let attendanceClass = '';
          
          if (isStudent) {
            const status = getStudentAttendanceStatus(user.id);
            if (status === "Present") {
              attendanceStatus = '(attended)';
              attendanceClass = 'attended';
            } else if (status === "Absent") {
              attendanceStatus = '(absent)';
              attendanceClass = 'absent';
            } else {
              attendanceStatus = '(Not yet)';
              attendanceClass = 'not-yet';
            }
          }

          return (
            <div key={schedule._id} className={`schedule-cell ${attendanceClass}`}>
              <div className="class-name">{className}</div>
              <div className="class-details">
                <span className="major-badge">{major}</span>
                <span className="tutor-name">• {tutorName}</span>
              </div>
              
              {isStudent && (
                <div className="attendance-status">
                  {attendanceStatus}
                </div>
              )}
              
              {isTutor && (
                <div className="attendance-actions">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleOpenAttendanceModal(schedule)}
                  >
                    Mark Attendance
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTimetable = (isTutor = false, isStudent = false) => {
    return (
      <div className="timetable-grid">
        <table className="timetable">
          <thead>
            <tr>
              <th className="time-column">Slot / Day</th>
              {daysInSelectedWeek.map((day, index) => (
                <th key={index} className="day-column">
                  <div className="day-header">
                    <div className="day-name">{weekDays[index]}</div>
                    <div className="day-date">{formatShortDate(day)}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(slotLabels).map(slot => {
              const slotNumber = parseInt(slot);
              return (
                <tr key={slot} className="time-slot">
                  <td className="slot-info">
                    <div className="slot-number">Slot {slot}</div>
                    <div className="slot-time">{slotLabels[slot]}</div>
                  </td>
                  
                  {daysInSelectedWeek.map((day, dayIndex) => {
                    const dateKey = day.toISOString().split('T')[0];
                    const daySchedules = schedulesGroupedByDayAndSlot[slotNumber]?.[dateKey] || [];
                    
                    return (
                      <td key={dateKey} className="day-slot">
                        {renderScheduleCell(daySchedules, dateKey, isTutor, isStudent)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <div className="timetable-filters">
        <div className="week-selector">
          <div className="filter-item">
            <label>Year:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="form-select"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Week:</label>
            <select 
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="form-select"
            >
              {weekOptions.map(weekOption => (
                <option key={weekOption.week} value={weekOption.week}>
                  Week {weekOption.week}: {weekOption.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Các bộ lọc bổ sung */}
        {user?.role === "Tutor" && tutorClasses.length > 0 && (
          <div className="filter-item">
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
      </div>
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

    const isTutor = user.role === "Tutor";
    const isStudent = user.role === "Student";

    return (
      <>
        <div className="user-timetable-header">
          <h2>My Schedule</h2>
          {renderFilters()}
        </div>
          
        {dataLoading ? (
          <div className="loading-container">
            <Loader />
          </div>
        ) : (
          renderTimetable(isTutor, isStudent)
        )}
        
        {isTutor && <AttendanceModal />}
      </>
    );
  };

  return (
    <div className="timetable-container">
      {renderContent()}
    </div>
  );
};

export default UserTimetable;
