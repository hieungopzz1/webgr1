import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../utils/api";
import { getUserData, isAuthenticated } from "../utils/storage";
import InputField from "../components/inputField/InputField";
import Button from "../components/button/Button";
import Loader from "../components/loader/Loader";
import Modal from "../components/modal/Modal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { useToast } from "../context/ToastContext";
import { useUser } from "../context/UserContext";
import Pagination from "../components/pagination/Pagination";
import { format } from 'date-fns';
import "./Timetable.css";

const Timetable = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  // Only store error state but display through toast
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  const [classFilter, setClassFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [tutorFilter, setTutorFilter] = useState("");

  const toast = useToast();
  const { users } = useUser(); // Use UserContext to get users data
  
  const classesRef = useRef();
  classesRef.current = classes;
  
  const tutorsRef = useRef();
  tutorsRef.current = tutors;

  const slotLabels = {
    1: "07:00 - 08:30",
    2: "08:45 - 10:15", 
    3: "10:30 - 12:00",
    4: "13:00 - 14:30",
    5: "14:45 - 16:15",
    6: "16:30 - 18:00"
  };

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
        
        if (err.response.data.message === "Some classes are already scheduled in this slot" && 
            err.response.data.classesAlreadyScheduled) {
          const classIds = err.response.data.classesAlreadyScheduled;
          const classNames = classIds.map(id => {
            const classInfo = classesRef.current.find(c => c._id === id);
            return classInfo ? classInfo.class_name : id;
          });
          
          if (classNames.length > 0) {
            errorMsg += `: ${classNames.join(', ')}`;
          }
        }
        
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
    toast.error(errorMsg);
    return errorMsg;
  }, [toast]);

  const fetchSchedulesForAdmin = useCallback(async () => {
    try {
      setDataLoading(true);
      const response = await api.get("/api/schedule/get-all-schedule");
      setSchedules(Array.isArray(response.data) ? response.data : []);
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch schedules");
      return err;
    } finally {
      setDataLoading(false);
    }
  }, [handleApiError]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get("/api/class/get-all-class");
      setClasses(Array.isArray(response.data) ? response.data : []);
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch classes");
      return err;
    }
  }, [handleApiError]);

  const fetchTutors = useCallback(async () => {
    try {
      // Sử dụng data từ UserContext thay vì gọi API
      const tutorsList = users.filter(user => user.role === 'Tutor');
      setTutors(tutorsList);
      return { data: { users: tutorsList } };
    } catch (err) {
      handleApiError(err, "Failed to fetch tutors");
      return err;
    }
  }, [users, handleApiError]);

  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Authentication required. Please log in again.");
      return;
    }

    Promise.all([
      fetchSchedulesForAdmin(),
      fetchClasses(),
      fetchTutors()
    ]).finally(() => {
      setDataLoading(false);
    });
  }, [fetchSchedulesForAdmin, fetchClasses, fetchTutors]);

  const handleCreateSchedule = useCallback(async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const requestData = {
        date: formData.date,
        slots: formData.slots,
        classType: formData.classType
      };

      const response = await api.post("/api/schedule/create-schedule", requestData);
      
      if (formData.createMeetLink && response.data && response.data.schedules) {
        const createdSchedules = response.data.schedules.filter(schedule => {
          const scheduleClassId = schedule.class._id || schedule.class;
          const selectedClassId = formData.slots[0].classes[0];
          
          return scheduleClassId.toString() === selectedClassId.toString();
        });
        
        for (const schedule of createdSchedules) {
          try {
            await api.post(`/api/schedule/create-meet/${schedule._id}`);
          } catch (meetError) {
            toast.error(`Failed to create Google Meet link for slot ${schedule.slot}: ${meetError.message}`);
          }
        }
      }
      
      const scheduleType = formData.classType || "Offline";
      const successMessage = scheduleType === "Online" 
        ? "Online schedule with Google Meet link created successfully!" 
        : "Schedule created successfully!";
        
      setSuccess(successMessage);
      toast.success(successMessage);
      setIsCreateModalOpen(false);
      
      await fetchSchedulesForAdmin();
      
      return response;
    } catch (err) {
      handleApiError(err, "Failed to create schedule");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedulesForAdmin, handleApiError, toast]);

  const handleUpdateSchedule = useCallback(async (scheduleId, formData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.put(`/api/schedule/update-schedule/${scheduleId}`, formData);
      const successMessage = "Schedule updated successfully!";
      setSuccess(successMessage);
      toast.success(successMessage);
      setIsEditModalOpen(false);
      fetchSchedulesForAdmin();
      return response;
    } catch (err) {
      handleApiError(err, "Failed to update schedule");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedulesForAdmin, handleApiError, toast]);

  const handleDeleteSchedule = useCallback(async (scheduleId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.delete(`/api/schedule/delete-schedule/${scheduleId}`);
      const successMessage = "Schedule deleted successfully!";
      setSuccess(successMessage);
      toast.success(successMessage);
      setIsDeleteModalOpen(false);
      fetchSchedulesForAdmin();
      return response;
    } catch (err) {
      handleApiError(err, "Failed to delete schedule");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedulesForAdmin, handleApiError, toast]);

  // Delete or use the handleCreateMeetLink function
  // eslint-disable-next-line no-unused-vars
  const handleCreateMeetLink = useCallback(async (scheduleId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.post(`/api/schedule/create-meet/${scheduleId}`);
      const successMessage = "Schedule updated to online with Google Meet link";
      setSuccess(successMessage);
      toast.success(successMessage);
      
      await fetchSchedulesForAdmin();
      return response;
    } catch (err) {
      handleApiError(err, "Failed to create Google Meet link");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedulesForAdmin, handleApiError, toast]);

  const formatDate = (dateString) => format(new Date(dateString), 'dd/MM/yyyy');

  const scheduledTutors = useMemo(() => {
    const tutorIds = new Set();
    
    schedules.forEach(schedule => {
      const classInfo = classes.find(c => c._id === (schedule.class._id || schedule.class));
      const tutorId = classInfo?.tutor_id || classInfo?.tutor || schedule.class.tutor_id || schedule.class.tutor;
      
      if (tutorId) {
        tutorIds.add(tutorId);
      }
    });
    
    return tutors.filter(tutor => tutorIds.has(tutor._id));
  }, [schedules, classes, tutors]);

  const filteredSchedules = schedules.filter(schedule => {
    let matchesClass = true;
    let matchesDate = true;
    let matchesTutor = true;
    
    if (classFilter) {
      matchesClass = schedule.class._id === classFilter || schedule.class === classFilter;
    }
    
    if (dateFilter) {
      const scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd');
      matchesDate = scheduleDate === dateFilter;
    }
    
    if (tutorFilter) {
      const classInfo = classes.find(c => c._id === (schedule.class._id || schedule.class));
      const tutorId = classInfo?.tutor_id || classInfo?.tutor || schedule.class.tutor_id || schedule.class.tutor;
      matchesTutor = tutorId === tutorFilter;
    }
    
    return matchesClass && matchesDate && matchesTutor;
  });

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: document.querySelector('.schedule-table').offsetTop - 20, behavior: 'smooth' });
  };

  const paginatedSchedules = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredSchedules, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredSchedules.length / itemsPerPage);
  }, [filteredSchedules, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [classFilter, dateFilter, tutorFilter]);

  const ScheduleForm = ({ onSubmit, initialData = {}, submitLabel }) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const [formData, setFormData] = useState({
      date: initialData.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : today,
      classId: initialData.classId || "",
      selectedSlots: initialData.selectedSlots || [],
      classType: initialData.classType || "Offline",
      createMeetLink: initialData.createMeetLink || false
    });
    
    const [errors, setErrors] = useState({});
    
    const handleDateChange = (value) => {
      setFormData(prev => ({
        ...prev,
        date: value
      }));
      
      if (value && errors.date) {
        setErrors(prev => ({ ...prev, date: undefined }));
      }
    };
    
    const handleClassChange = (value) => {
      setFormData(prev => ({
        ...prev,
        classId: value,
        selectedSlots: []
      }));
      
      if (value && errors.classId) {
        setErrors(prev => ({ ...prev, classId: undefined }));
      }
    };
    
    const handleClassTypeChange = (value) => {
      setFormData(prev => ({
        ...prev,
        classType: value,
        createMeetLink: value === "Online" ? prev.createMeetLink : false
      }));
    };
    
    const handleCreateMeetLinkChange = (checked) => {
      setFormData(prev => ({
        ...prev,
        createMeetLink: checked
      }));
    };
    
    const handleSlotToggle = (slotNumber) => {
      setFormData(prev => {
        const isSelected = prev.selectedSlots.includes(slotNumber);
        let newSelectedSlots;
        
        if (isSelected) {
          newSelectedSlots = prev.selectedSlots.filter(slot => slot !== slotNumber);
        } else {
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
        const submissionData = {
          date: formData.date,
          slots: formData.selectedSlots.map(slotNumber => ({
            slot: slotNumber,
            classes: [formData.classId]
          })),
          classType: formData.classType,
          createMeetLink: formData.classType === "Online" && formData.createMeetLink
        };
        
        onSubmit(submissionData);
      }
    };
    
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
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Class Type</label>
                <div className="class-type-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="classType"
                      value="Offline"
                      checked={formData.classType === "Offline"}
                      onChange={() => handleClassTypeChange("Offline")}
                    />
                    <span>Offline</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="classType"
                      value="Online"
                      checked={formData.classType === "Online"}
                      onChange={() => handleClassTypeChange("Online")}
                    />
                    <span>Online</span>
                  </label>
                </div>
              </div>
              
              {formData.classType === "Online" && (
                <div className="form-group">
                  <div className="meet-option">
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={formData.createMeetLink}
                        onChange={(e) => handleCreateMeetLinkChange(e.target.checked)}
                      />
                      <span>Automatically create Google Meet link</span>
                    </label>
                    <div className="meet-info">
                      {formData.createMeetLink && (
                        <small className="text-info">
                          <i className="fas fa-info-circle"></i> A Google Meet link will be created when schedule is saved
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
          </>
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

  const renderModals = () => (
    <>
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(selectedSchedule._id)}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
      />
    </>
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

  const renderScheduleTable = () => (
    <table className="schedule-table">
      <thead>
        <tr>
          <th>Class</th>
          <th>Major</th>
          <th>Tutor Name</th>
          <th>Date</th>
          <th>Slot</th>
          <th>Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {paginatedSchedules.length === 0 ? (
          <tr>
            <td colSpan={7} className="no-data">
              {dataLoading ? "Loading schedules..." : "No schedules found"}
            </td>
          </tr>
        ) : (
          paginatedSchedules.map(schedule => {
            const classInfo = classes.find(c => c._id === (schedule.class._id || schedule.class));
            const className = classInfo ? classInfo.class_name : (schedule.class.class_name || "Unknown Class");
            const major = classInfo ? classInfo.major : (schedule.class.major || "Unknown Major");
            
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
                <td>
                  {schedule.meetingLink ? (
                    <div className="admin-meeting-info">
                      <span className="admin-class-type online">Online</span>
                      <a 
                        href={schedule.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="admin-meet-link"
                        title="Open in new tab"
                      >
                        <i className="fas fa-video"></i> Join Meet
                      </a>
                    </div>
                  ) : (
                    <span className="admin-class-type offline">Offline</span>
                  )}
                </td>
                <td className="action-buttons">
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
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  return (
    <div className="timetable-container">
      {!user ? (
        <div className="loading-container">
          <Loader />
        </div>
      ) : (
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
            <>
              {renderScheduleTable()}
              
              {totalPages > 1 && (
                <div className="pagination-container">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
          
          {renderModals()}
        </>
      )}
    </div>
  );
};

export default Timetable;
