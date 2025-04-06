const express = require('express');
const router = express.Router();
const uploadDocuments = require('../config/multerDocuments');  // Import Multer config cho tài liệu
const documentController = require('../controllers/documentController');
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');

// Upload document (requires authentication)
router.post('/upload-document', 
  authenticateUser, 
  uploadDocuments.single('document'), 
  documentController.uploadDocument
);

// Get all documents (Admin only)
router.get('/', 
  authenticateUser, 
  authorizeRole(['Admin']), 
  documentController.getDocuments
);

// Get document by ID (requires authentication)
router.get('/:id', 
  authenticateUser, 
  documentController.getDocumentById
);

// Update document (requires authentication)
router.put('/:id', 
  authenticateUser, 
  uploadDocuments.single('document'), 
  documentController.updateDocument
);

// Delete document (requires authentication)
router.delete('/:id', 
  authenticateUser, 
  documentController.deleteDocument
);

// Get documents by class (requires authentication)
router.get('/class/:classId', 
  authenticateUser, 
  documentController.getDocumentsByClass
);

// Get assignments for a class (requires authentication)
router.get('/class/:classId/assignments', 
  authenticateUser, 
  documentController.getClassAssignments
);

// Get submissions for a class (requires authentication)
router.get('/class/:classId/submissions', 
  authenticateUser, 
  documentController.getClassSubmissions
);

// Get tutor's classes with documents (for tutor dashboard)
router.get('/tutor/:tutorId/classes', 
  authenticateUser, 
  documentController.getTutorClassesWithDocuments
);

// Get student's classes with documents (for student dashboard)
router.get('/student/:studentId/classes', 
  authenticateUser, 
  documentController.getStudentClassesWithDocuments
);

module.exports = router;
