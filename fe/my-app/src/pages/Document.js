import React, { useState, useEffect, useCallback, useRef } from "react";
import { format } from 'date-fns';
import api from "../utils/api";
import { getUserData, isAuthenticated } from "../utils/storage";
import Button from "../components/button/Button";
import Loader from "../components/loader/Loader";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import { useToast } from "../context/ToastContext";
import "./Document.css";

const Document = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentType, setDocumentType] = useState("all"); // all, assignment, submission
  
  const toast = useToast();

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  useEffect(() => {
    if (isAuthenticated()) {
      const userData = getUserData();
      
      if (userData && userData.role !== "Admin") {
        window.location.href = "/user-document";
        return;
      }
      
      setUser(userData);
    }
  }, []);

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
    
    toast.error(errorMsg);
    return errorMsg;
  }, [toast]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get("/api/class/get-all-class");
      setClasses(Array.isArray(response.data) ? response.data : []);
      return response;
    } catch (err) {
      handleApiError(err, "Failed to fetch classes");
    }
  }, [handleApiError]);

  const fetchDocuments = useCallback(async (classId = null) => {
    if (!classId) return;
    
    try {
      setDataLoading(true);
      const url = documentType === "assignment" 
        ? `/api/documents/class/${classId}/assignments`
        : documentType === "submission"
          ? `/api/documents/class/${classId}/submissions`
          : `/api/documents/class/${classId}`;
      
      const response = await api.get(url);
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      handleApiError(err, "Failed to fetch documents");
    } finally {
      setDataLoading(false);
    }
  }, [handleApiError, documentType]);

  const handleDeleteDocument = useCallback(async (documentId) => {
    try {
      setLoading(true);
      await api.delete(`/api/documents/${documentId}`, {
        data: { userId: user.id, userRole: user.role }
      });
      
      toast.success("Document deleted successfully");
      fetchDocuments(selectedClass);
      setIsDeleteModalOpen(false);
    } catch (err) {
      handleApiError(err, "Failed to delete document");
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments, handleApiError, selectedClass, user, toast]);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    fetchClasses().finally(() => setDataLoading(false));
  }, [fetchClasses, toast]);

  useEffect(() => {
    if (selectedClass) {
      fetchDocuments(selectedClass);
    }
  }, [selectedClass, fetchDocuments, documentType]);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

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
      toast.success("Download started");
    } catch (error) {
      toast.error(`Download failed: ${error.message}`);
      console.error("Download error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentsTable = () => {
    if (!selectedClass) {
      return (
        <div className="no-class-selected">
          <p>Please select a class to view documents</p>
        </div>
      );
    }

    if (dataLoading) {
      return (
        <div className="loading-container">
          <Loader />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="no-documents">
          <p>No documents found for this class</p>
        </div>
      );
    }

    return (
      <div className="documents-table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Uploaded By</th>
              <th>Size</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => {
              const uploaderName = doc.tutor_id && typeof doc.tutor_id === 'object'
                ? `${doc.tutor_id.firstName} ${doc.tutor_id.lastName} (Tutor)`
                : doc.student_id && typeof doc.student_id === 'object'
                  ? `${doc.student_id.firstName} ${doc.student_id.lastName} (Student)`
                  : "Unknown";
              
              const isAssignment = doc.document_type === 'assignment';
              
              return (
                <tr key={doc._id}>
                  <td>{doc.originalname}</td>
                  <td>
                    <span className={`badge badge-${isAssignment ? 'primary' : 'secondary'}`}>
                      {isAssignment ? 'Assignment' : 'Submission'}
                    </span>
                  </td>
                  <td>{uploaderName}</td>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="document-admin-container">
      {!user ? (
        <div className="loading-container">
          <Loader />
        </div>
      ) : (
        <>
          <div className="admin-controls">
            <h2>Document Management</h2>
          </div>

          <div className="filter-panel">
            <div className="filter-item">
              <label>Select Class</label>
              <select
                value={selectedClass || ""}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="form-select"
              >
                <option value="">Select a class</option>
                {classes.map(classItem => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.class_name} - {classItem.subject} ({classItem.major})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedClass && (
              <div className="filter-item">
                <label>Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Documents</option>
                  <option value="assignment">Assignments (from Tutors)</option>
                  <option value="submission">Submissions (from Students)</option>
                </select>
              </div>
            )}
          </div>
          
          {renderDocumentsTable()}
          
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

export default Document;
