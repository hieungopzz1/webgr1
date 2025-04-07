import React, { useState, useEffect, useCallback, useRef } from "react";
import { format } from 'date-fns';
import api from "../utils/api";
import { getUserData, isAuthenticated } from "../utils/storage";
import Button from "../components/button/Button";
import Loader from "../components/loader/Loader";
import Modal from "../components/modal/Modal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { useNotifications } from "../context/NotificationContext";
import "./userDocument.css";

const UserDocument = () => {
  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [documents, setDocuments] = useState({});
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  
  // Refs
  const { success, showError } = useNotifications();
  const notificationRef = useRef({ success, showError });
  const fileInputRef = useRef(null);

  // Keep notification ref updated
  useEffect(() => {
    notificationRef.current = { success, showError };
  }, [success, showError]);

  // Utility functions
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return dateString ? format(new Date(dateString), 'dd/MM/yyyy HH:mm') : 'N/A';
  };

  // Error handling
  const handleApiError = useCallback((err, defaultMessage = "An error occurred") => {
    let errorMsg = defaultMessage;
    
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
    
    notificationRef.current.showError(errorMsg);
    return errorMsg;
  }, []);

  // Fetch classes data
  const fetchUserClasses = useCallback(async () => {
    if (!user) return;
    
    try {
      setDataLoading(true);
      let response;
      
      if (user.role === "Tutor") {
        response = await api.get(`/api/documents/tutor/${user.id}/classes`);
      } else if (user.role === "Student") {
        response = await api.get(`/api/documents/student/${user.id}/classes`);
      } else {
        return;
      }
      
      if (response.data && response.data.classes) {
        const receivedClasses = response.data.classes;
        
        if (Array.isArray(receivedClasses)) {
          setClasses(receivedClasses);
          
          const docsObj = {};
          receivedClasses.forEach(cls => {
            if (cls && cls.class && cls.class._id) {
              docsObj[cls.class._id] = {
                assignments: cls.assignments || [],
                submissions: user.role === "Student" 
                  ? (cls.studentSubmissions || []) 
                  : (cls.submissions || [])
              };
            }
          });
          
          setDocuments(docsObj);
        } else {
          notificationRef.current.showError("Invalid data format received from server");
        }
      } else if (response.data && response.data.message) {
        setClasses([]);
        setDocuments({});
      } else {
        notificationRef.current.showError("Invalid response format received from server");
      }
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data?.message) {
        notificationRef.current.showError(err.response.data.message);
      } else {
        handleApiError(err, "Failed to fetch your classes");
      }
      
      setClasses([]);
      setDocuments({});
    } finally {
      setDataLoading(false);
    }
  }, [user, handleApiError]);

  // Upload document
  const handleUploadDocument = useCallback(async () => {
    if (!uploadFile || !selectedClass || !user) return;
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('document', uploadFile);
      formData.append('userId', user.id);
      formData.append('classId', selectedClass);
      formData.append('documentType', user.role === "Tutor" ? "assignment" : "submission");
      
      await api.post('/api/documents/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      notificationRef.current.success("Document uploaded successfully");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      fetchUserClasses();
    } catch (err) {
      handleApiError(err, "Failed to upload document");
    } finally {
      setLoading(false);
    }
  }, [uploadFile, selectedClass, user, fetchUserClasses, handleApiError]);

  // Delete document
  const handleDeleteDocument = useCallback(async (documentId) => {
    if (!documentId || !user) return;
    
    try {
      setLoading(true);
      
      await api.delete(`/api/documents/${documentId}`, {
        data: { userId: user.id, userRole: user.role }
      });
      
      notificationRef.current.success("Document deleted successfully");
      setIsDeleteModalOpen(false);
      
      fetchUserClasses();
    } catch (err) {
      handleApiError(err, "Failed to delete document");
    } finally {
      setLoading(false);
    }
  }, [user, fetchUserClasses, handleApiError]);

  // Download document
  const downloadDocument = async (fileUrl, fileName) => {
    try {
      setLoading(true);
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      
      anchor.href = url;
      anchor.download = fileName || 'document';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      notificationRef.current.success("Download started");
    } catch (error) {
      notificationRef.current.showError(`Download failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // UI helpers
  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Load user data on mount
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUserData());
    }
  }, []);

  // Fetch classes when user is available
  useEffect(() => {
    if (!isAuthenticated()) {
      notificationRef.current.showError("Authentication required. Please log in again.");
      return;
    }
    
    if (user) {
      fetchUserClasses();
    }
  }, [user, fetchUserClasses]);

  // Update selected class detail when class changes
  useEffect(() => {
    if (selectedClass) {
      setSelectedClassDetail(classes.find(c => c.class._id === selectedClass));
    } else {
      setSelectedClassDetail(null);
    }
  }, [selectedClass, classes]);

  // Render upload modal
  const renderUploadModal = () => (
    <Modal
      isOpen={isUploadModalOpen}
      onClose={closeUploadModal}
      title={`Upload ${user?.role === "Tutor" ? "Assignment" : "Submission"}`}
    >
      <div className="upload-form">
        <p className="upload-info">
          You are uploading a {user?.role === "Tutor" ? "assignment for students" : "submission"} to class:
          <strong> {selectedClassDetail?.class?.class_name || ""}</strong>
        </p>
        
        <div className="file-input-container">
          <label htmlFor="document">Select File (PDF, DOC, DOCX, max 10MB):</label>
          <input
            type="file"
            id="document"
            ref={fileInputRef}
            onChange={(e) => e.target.files && e.target.files[0] && setUploadFile(e.target.files[0])}
            accept=".pdf,.doc,.docx"
            className="file-input"
          />
        </div>
        
        {uploadFile && (
          <div className="file-info">
            <p>File: {uploadFile.name}</p>
            <p>Size: {formatFileSize(uploadFile.size)}</p>
          </div>
        )}
        
        <div className="modal-actions">
          <Button variant="secondary" onClick={closeUploadModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUploadDocument}
            disabled={!uploadFile || loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Render assignments list
  const renderAssignments = () => {
    if (!selectedClass || !documents[selectedClass]) {
      return <div className="no-documents"><p>No assignments available</p></div>;
    }

    const assignments = documents[selectedClass].assignments || [];
    
    if (assignments.length === 0) {
      return <div className="no-documents"><p>No assignments available for this class</p></div>;
    }

    return (
      <div className="documents-table-container">
        <h3>Assignments from Tutor</h3>
        <table className="documents-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Size</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(doc => (
              <tr key={doc._id}>
                <td>{doc.originalname}</td>
                <td>{formatFileSize(doc.size)}</td>
                <td>{doc.createdAt ? formatDate(doc.createdAt) : 'N/A'}</td>
                <td className="action-buttons">
                  <Button 
                    variant="primary" 
                    size="small"
                    onClick={() => downloadDocument(doc.fileUrl, doc.originalname)}
                  >
                    Download
                  </Button>
                  {user.role === "Tutor" && user.id === (doc.tutor_id?._id || doc.tutor_id) && (
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render submissions list
  const renderSubmissions = () => {
    if (!selectedClass || !documents[selectedClass]) {
      return null;
    }

    const submissions = documents[selectedClass].submissions || [];
    const isTutor = user.role === "Tutor";
    const title = isTutor ? "Student Submissions" : "My Submissions";
    
    if (submissions.length === 0) {
      return (
        <div className="documents-section">
          <h3>{title}</h3>
          <div className="no-documents">
            <p>{isTutor ? "No student submissions for this class yet" : "You haven't submitted any documents for this class yet"}</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="documents-section">
        <h3>{title}</h3>
        <table className="documents-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Size</th>
              <th>Submitted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(doc => (
              <tr key={doc._id}>
                <td>{doc.originalname}</td>
                <td>{formatFileSize(doc.size)}</td>
                <td>{doc.createdAt ? formatDate(doc.createdAt) : 'N/A'}</td>
                <td className="action-buttons">
                  <Button 
                    variant="primary" 
                    size="small"
                    onClick={() => downloadDocument(doc.fileUrl, doc.originalname)}
                  >
                    Download
                  </Button>
                  {!isTutor && (
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render documents content
  const renderDocumentsContent = () => {
    if (dataLoading) {
      return <div className="loading-container"><Loader /></div>;
    }

    if (classes.length === 0) {
      return <div className="no-classes"><p>You are not assigned to any classes yet.</p></div>;
    }

    if (!selectedClass) {
      return <div className="no-class-selected"><p>Please select a class to view documents</p></div>;
    }

    return (
      <div className="documents-content">
        <div className="documents-header">
          <h3>Documents for {selectedClassDetail?.class?.class_name}</h3>
          <Button
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload {user?.role === "Tutor" ? "Assignment" : "Submission"}
          </Button>
        </div>
        
        <div className="documents-sections">
          {renderAssignments()}
          {renderSubmissions()}
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="user-document-container">
      {!user ? (
        <div className="loading-container"><Loader /></div>
      ) : (
        <>
          <div className="user-document-header">
            <h2>{user.role === "Tutor" ? "My Class Documents" : "My Class Assignments"}</h2>
            
            <div className="filter-panel">
              <div className="filter-item">
                <label>Select Class</label>
                <select
                  value={selectedClass || ""}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.class._id} value={cls.class._id}>
                      {cls.class.class_name} - {cls.class.subject || ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {renderDocumentsContent()}
          {renderUploadModal()}
          
          <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => handleDeleteDocument(selectedDocument?._id)}
            title="Delete Document"
            message="Are you sure you want to delete this document? This action cannot be undone."
          />
        </>
      )}
    </div>
  );
};

export default UserDocument;
