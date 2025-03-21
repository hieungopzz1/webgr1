const express = require('express');
const router = express.Router();
const uploadDocuments = require('../config/multerDocuments');  // Import Multer config cho tài liệu
const documentController = require('../controllers/documentController');

// Upload document
router.post('/upload-document', uploadDocuments.single('document'), documentController.uploadDocument);

// Get all documents
router.get('/', documentController.getDocuments);

// Get document by ID
router.get('/:id', documentController.getDocumentById);

// Update document
router.put('/:id', uploadDocuments.single('document'), documentController.updateDocument);

// Delete document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
