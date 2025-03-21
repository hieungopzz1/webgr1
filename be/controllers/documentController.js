const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    const userId = req.body.userId;

    let tutor_id = null;
    let student_id = null;

    // Check if the uploader is a Tutor or Student
    const tutor = await Tutor.findById(userId);
    const student = await Student.findById(userId);

    if (tutor) {
      tutor_id = userId;
    } else if (student) {
      student_id = userId;
    } else {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save document information to MongoDB
    const newDocument = new Document({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fileUrl: fileUrl,
      tutor_id: tutor_id,
      student_id: student_id,
    });

    await newDocument.save();

    res.status(200).json({
      message: 'Document uploaded successfully',
      file: req.file,
      fileUrl: fileUrl,
      tutor_id: tutor_id,
      student_id: student_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading document', error: err });
  }
};

// Get all documents
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find();
    res.status(200).json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching documents', error: err });
  }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching document', error: err });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete old document from the file system
    const oldFilePath = path.join(__dirname, `../uploads/documents/${document.filename}`);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);  // Delete old file
    }

    // Update document info
    document.filename = req.file.filename;
    document.originalname = req.file.originalname;
    document.mimetype = req.file.mimetype;
    document.size = req.file.size;
    document.fileUrl = `/uploads/documents/${req.file.filename}`;

    await document.save();

    res.status(200).json({
      message: 'Document updated successfully',
      file: req.file,
      fileUrl: document.fileUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating document', error: err });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete document from the file system
    const filePath = path.join(__dirname, `../uploads/documents/${document.filename}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);  // Delete file
    }

    await document.remove();

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting document', error: err });
  }
};
