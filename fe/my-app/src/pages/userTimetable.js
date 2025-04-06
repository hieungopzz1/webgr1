import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../utils/api";
import { getUserData, isAuthenticated } from "../utils/storage";
import InputField from "../components/inputField/InputField";
import Button from "../components/button/Button";
import Loader from "../components/loader/Loader";
import Modal from "../components/modal/Modal";
import { useNotification } from "../context/NotificationContext";
import { 
  getWeek, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  getWeeksInYear, 
  getYear,
  addDays,
  setWeek,
  startOfYear,
  endOfYear 
} from 'date-fns';
import { vi } from 'date-fns/locale';
import "./userTimetable.css";

const UserTimetable = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({ presentStudents: [], absentStudents: [] });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [studentAttendances, setStudentAttendances] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(getYear(currentDate));
  const [selectedWeek, setSelectedWeek] = useState(getWeek(currentDate, { weekStartsOn: 1 }));
  
  const [classFilter, setClassFilter] = useState("");
  const [tutorClasses, setTutorClasses] = useState([]);
  const [dateFilter, setDateFilter] = useState("");

  const [studentAttendanceMap, setStudentAttendanceMap] = useState({});

  const { success: showSuccess, error: showError } = useNotification();
  
  const notificationRef = useRef();
  notificationRef.current = { showSuccess, showError };

  const classesRef = useRef();
  classesRef.current = classes;

  const slotLabels = {
    1: "07:00 - 08:30",
    2: "08:45 - 10:15", 
    3: "10:30 - 12:00",
    4: "13:00 - 14:30",
    5: "14:45 - 16:15",
    6: "16:30 - 18:00"
  };

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };

  const formatShortDate = (date) => {
    return format(date, 'dd/MM');
  };

  const getAvailableWeeksInYear = (year) => {
    const weeks = [];
    
    const lastDayOfYear = new Date(year, 11, 31);
    const totalDays = lastDayOfYear.getDate() + 
      (31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30);
    
    const totalWeeks = Math.ceil(totalDays / 7) + 1;
    
    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      const dayOfYear = (weekNum - 1) * 7 + 1;
      let weekStart = new Date(year, 0, dayOfYear);
      
      const dayOfWeek = weekStart.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(weekStart.getDate() + diff);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      if (weekEnd.getFullYear() < year) continue;
      if (weekStart.getFullYear() > year) break;
      
      weeks.push({
        week: weekNum,
        label: `${format(weekStart, 'dd/MM/yyyy')} - ${format(weekEnd, 'dd/MM/yyyy')}`
      });
    }
    
    return weeks;
  };

  const yearOptions = useMemo(() => {
    const currentYear = getYear(new Date());
    return [currentYear - 1, currentYear, currentYear + 1];
  }, []);

  const weekOptions = useMemo(() => {
    return getAvailableWeeksInYear(selectedYear);
  }, [selectedYear]);

  const daysInSelectedWeek = useMemo(() => {
    const firstDayOfYear = new Date(selectedYear, 0, 1);
    
    const dayOfYear = (selectedWeek - 1) * 7 + 1;
    const dateOfFirstDayOfWeek = new Date(selectedYear, 0, dayOfYear);
    
    const dayOfWeek = dateOfFirstDayOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekStartDate = new Date(dateOfFirstDayOfWeek);
    weekStartDate.setDate(dateOfFirstDayOfWeek.getDate() + diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStartDate);
      day.setDate(weekStartDate.getDate() + i);
      days.push(day);
    }
    
    return days;
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

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get("/api/class/get-all-class");
      
      if (response.data && Array.isArray(response.data.classes)) {
        setClasses(response.data.classes);
      } else if (response.data && Array.isArray(response.data)) {
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

  const filteredSchedulesByWeek = useMemo(() => {
    if (!daysInSelectedWeek.length) return [];
    
    const startDate = daysInSelectedWeek[0];
    const endDate = daysInSelectedWeek[6];
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate >= startDate && scheduleDate <= endOfDay;
    });
  }, [schedules, daysInSelectedWeek]);

  const schedulesGroupedByDayAndSlot = useMemo(() => {
    const groupedSchedules = {};
    
    for (let slot = 1; slot <= 6; slot++) {
      groupedSchedules[slot] = {};
      daysInSelectedWeek.forEach((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        groupedSchedules[slot][dateKey] = [];
      });
    }
    
    filteredSchedulesByWeek.forEach(schedule => {
      const dateKey = format(new Date(schedule.date), 'yyyy-MM-dd');
      const slot = schedule.slot;
      
      if (groupedSchedules[slot] && groupedSchedules[slot][dateKey]) {
        groupedSchedules[slot][dateKey].push(schedule);
      }
    });
    
    return groupedSchedules;
  }, [filteredSchedulesByWeek, daysInSelectedWeek]);

  const fetchStudentAttendanceData = useCallback(async () => {
    if (user?.role !== "Student" || !filteredSchedulesByWeek.length) return;
    
    try {
      const newAttendanceMap = {};
      
      for (const schedule of filteredSchedulesByWeek) {
        try {
          const response = await api.get(`/api/attendance/${schedule._id}/status`);
          const data = response.data;
          
          const isPresentStudent = data.presentStudents.some(student => student._id === user.id);
          const isAbsentStudent = data.absentStudents.some(student => student._id === user.id);
          
          if (isPresentStudent) {
            newAttendanceMap[schedule._id] = "Present";
          } else if (isAbsentStudent) {
            newAttendanceMap[schedule._id] = "Absent";
          } else {
            newAttendanceMap[schedule._id] = null;
          }
        } catch (err) {
        }
      }
      
      setStudentAttendanceMap(newAttendanceMap);
    } catch (err) {
    }
  }, [user, filteredSchedulesByWeek]);

  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Authentication required. Please log in again.");
      return;
    }

    const userData = getUserData();
    if (!userData) return;

    fetchClasses();

    if (userData.role === "Student") {
      fetchSchedulesForStudent().finally(() => {
        setDataLoading(false);
      });
    } else if (userData.role === "Tutor") {
      fetchSchedulesForTutor().finally(() => {
        setDataLoading(false);
      });
    }
  }, [fetchSchedulesForStudent, fetchSchedulesForTutor, fetchClasses]);

  useEffect(() => {
    if (user?.role === "Student") {
      fetchStudentAttendanceData();
    }
  }, [filteredSchedulesByWeek, fetchStudentAttendanceData, user]);

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
      
      if (user?.role === "Student") {
        fetchStudentAttendanceData();
      } else if (selectedSchedule) {
        await fetchAttendanceStatus(selectedSchedule._id);
      }
      
      setIsAttendanceModalOpen(false);
      return response;
    } catch (err) {
      handleApiError(err, "Failed to mark attendance");
      return err;
    } finally {
      setLoading(false);
    }
  }, [handleApiError, fetchStudentAttendanceData, fetchAttendanceStatus, selectedSchedule, user]);

  const handleOpenAttendanceModal = useCallback(async (schedule) => {
    setSelectedSchedule(schedule);
    try {
      await fetchStudentsBySchedule(schedule._id);
      await fetchAttendanceStatus(schedule._id);
      setIsAttendanceModalOpen(true);
    } catch (error) {
    }
  }, [fetchStudentsBySchedule, fetchAttendanceStatus]);

  const getStudentAttendanceStatus = useCallback((studentId, scheduleId) => {
    if (user?.role === "Student" && studentId === user.id && scheduleId) {
      return studentAttendanceMap[scheduleId];
    }
    
    const isPresentStudent = attendanceStatus.presentStudents.some(student => student._id === studentId);
    if (isPresentStudent) return "Present";
    
    const isAbsentStudent = attendanceStatus.absentStudents.some(student => student._id === studentId);
    if (isAbsentStudent) return "Absent";
    
    return null;
  }, [attendanceStatus, studentAttendanceMap, user]);

  const [tutorCache, setTutorCache] = useState({});

  const TutorName = ({ tutorData }) => {
    const [tutorName, setTutorName] = useState("Not Assigned");
    
    useEffect(() => {
      if (!tutorData) {
        setTutorName("Not Assigned");
        return;
      }
      
      if (typeof tutorData === 'string') {
        setTutorName(tutorData);
        return;
      }
      
      if (tutorData.firstName && tutorData.lastName) {
        setTutorName(`${tutorData.firstName} ${tutorData.lastName}`);
        return;
      }
      
      if (tutorData.tutor_name) {
        setTutorName(tutorData.tutor_name);
        return;
      }
      
      if (tutorData.name) {
        setTutorName(tutorData.name);
        return;
      }
      
      setTutorName("Not Assigned");
    }, [tutorData]);
    
    return <>{tutorName}</>;
  };

  const renderScheduleCell = (schedules, dayKey, isTutor, isStudent) => {
    if (!schedules || schedules.length === 0) {
      return <div className="empty-cell"></div>;
    }

    return (
      <div className="schedule-cells">
        {schedules.map(schedule => {
          let classData = null;
          if (typeof schedule.class === 'object' && schedule.class) {
            classData = schedule.class;
          } else if (schedule.class) {
            classData = classes.find(c => c._id === schedule.class) || { class_name: "Unknown Class" };
          }
          
          const className = classData?.class_name || "Unknown Class";
          const subject = classData?.subject || "Unknown Subject";
          
          let tutorData = null;
          
          if (classData?.tutor) {
            tutorData = classData.tutor;
          } else if (classData?.tutor_name) {
            tutorData = classData.tutor_name;
          } else if (schedule.tutor) {
            tutorData = schedule.tutor;
          } else if (schedule.tutor_name) {
            tutorData = schedule.tutor_name;
          }
          
          let attendanceStatus = '';
          let attendanceClass = '';
          
          if (isStudent) {
            const status = getStudentAttendanceStatus(user.id, schedule._id);
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
                <span className="major-badge">{subject}</span>
                {isStudent && (
                  <span className="tutor-name">
                    <TutorName tutorData={tutorData} />
                  </span>
                )}
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
                    const dateKey = format(day, 'yyyy-MM-dd');
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

  const renderWeekSelector = () => {
    return (
      <div className="timetable-week-controls">
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
    
    const isLoading = dataLoading || classes.length === 0;

    return (
      <>
        <div className="user-timetable-header">
          <h2>My Schedule</h2>
          {renderWeekSelector()}
        </div>
          
        {isLoading ? (
          <div className="loading-container">
            <Loader />
            <p>Loading class data...</p>
          </div>
        ) : (
          renderTimetable(isTutor, isStudent)
        )}
        
        {isTutor && <AttendanceModal />}
      </>
    );
  };

  const AttendanceModal = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    
    useEffect(() => {
      if (isAttendanceModalOpen && studentsInClass.length > 0) {
        const initialAttendance = studentsInClass.map(student => {
          const status = getStudentAttendanceStatus(student._id, selectedSchedule?._id);
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
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsInClass.map(student => (
                        <tr key={student._id}>
                          <td className="student-id" title={student.email || "No email available"}>
                            {student.student_ID || "ID không có sẵn"}
                          </td>
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

  return (
    <div className="timetable-container">
      {renderContent()}
    </div>
  );
};

export default UserTimetable;
