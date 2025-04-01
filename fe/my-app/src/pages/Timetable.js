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
  // State chung
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // State cho modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // State cho filter/sort
  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Lấy thông tin user
  useEffect(() => {
    if (isAuthenticated()) {
      const userData = getUserData();
      setUser(userData);
    }
  }, []);

  // Xử lý lỗi API
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

  // Fetch tất cả lịch học
  const fetchSchedules = useCallback(async () => {
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

  // Fetch tất cả lớp học
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

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Authentication required. Please log in again.");
      return;
    }
    
    Promise.all([fetchSchedules(), fetchClasses()]);
  }, [fetchSchedules, fetchClasses]);

  // Tạo lịch học mới
  const handleCreateSchedule = useCallback(async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.post("/api/schedule/create-schedule", formData);
      setSuccess("Schedule created successfully!");
      setIsCreateModalOpen(false);
      fetchSchedules();
      return response;
    } catch (err) {
      handleApiError(err, "Failed to create schedule");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules, handleApiError]);

  // Cập nhật lịch học
  const handleUpdateSchedule = useCallback(async (scheduleId, formData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.put(`/api/schedule/update-schedule/${scheduleId}`, formData);
      setSuccess("Schedule updated successfully!");
      setIsEditModalOpen(false);
      fetchSchedules();
      return response;
    } catch (err) {
      handleApiError(err, "Failed to update schedule");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules, handleApiError]);

  // Xóa lịch học
  const handleDeleteSchedule = useCallback(async (scheduleId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.delete(`/api/schedule/delete-schedule/${scheduleId}`);
      setSuccess("Schedule deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchSchedules();
      return response;
    } catch (err) {
      handleApiError(err, "Failed to delete schedule");
      return err;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules, handleApiError]);

  // Format date from ISO string to display format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filtered schedules based on filters
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

  // ---------- Render components ----------

  // Schedule Form Component (used in Create and Edit modals)
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
      
      // Clear error for field if it has value
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

  // Create Schedule Modal
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

  // Edit Schedule Modal
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

  // Delete Confirmation Modal
  const DeleteScheduleModal = () => (
    <ConfirmModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={() => handleDeleteSchedule(selectedSchedule._id)}
      title="Delete Schedule"
      message="Are you sure you want to delete this schedule? This action cannot be undone."
    />
  );

  // Filter Panel
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

  // Schedule Table
  const renderScheduleTable = () => (
    <table className="schedule-table">
      <thead>
        <tr>
          <th>Class</th>
          <th>Date</th>
          <th>Time</th>
          <th>Type</th>
          <th>Location/Link</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredSchedules.length === 0 ? (
          <tr>
            <td colSpan="6" className="no-data">
              {dataLoading ? "Loading schedules..." : "No schedules found"}
            </td>
          </tr>
        ) : (
          filteredSchedules.map(schedule => {
            const classInfo = classes.find(c => c._id === (schedule.class._id || schedule.class));
            const className = classInfo ? classInfo.class_name : "Unknown Class";
            
            return (
              <tr key={schedule._id}>
                <td>{schedule.class.class_name || className}</td>
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
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  // Main render based on user role
  const renderContent = () => {
    if (!user) {
      return (
        <div className="loading-container">
          <Loader />
        </div>
      );
    }

    // For Admin role
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
            renderScheduleTable()
          )}
          
          <CreateScheduleModal />
          <EditScheduleModal />
          <DeleteScheduleModal />
        </>
      );
    }

    // For Student & Tutor roles (will implement later)
    return (
      <div className="message-container">
        <p>Timetable view for {user.role} is under development.</p>
      </div>
    );
  };

  // Main component render
  return (
    <div className="timetable-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {renderContent()}
    </div>
  );
};

export default Timetable;
