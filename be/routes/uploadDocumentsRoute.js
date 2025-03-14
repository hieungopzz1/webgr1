const express = require('express');
const fs = require('fs');
const path = require('path');
const uploadDocuments = require('../config/multerDocuments');  // Import Multer config cho tài liệu
const Document = require('../models/Document');  // Import model Document
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const router = express.Router();

// Create (POST) - Upload tài liệu mới và lưu vào MongoDB
router.post('/upload-document', uploadDocuments.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;

    // Lấy ID người upload từ body hoặc từ token
    const userId = req.body.userId;  // ID người upload (có thể lấy từ frontend)

    let tutor_id = null;
    let student_id = null;

    // Kiểm tra người upload là Tutor hay Student
    const tutor = await Tutor.findById(userId);
    const student = await Student.findById(userId);

    if (tutor) {
      tutor_id = userId;  // Nếu là Tutor, lưu ID của Tutor vào tutor_id
    } else if (student) {
      student_id = userId;  // Nếu là Student, lưu ID của Student vào student_id
    } else {
      return res.status(404).json({ message: 'User not found' });
    }

    // Lưu thông tin tài liệu vào MongoDB
    const newDocument = new Document({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fileUrl: fileUrl,
      tutor_id: tutor_id,  // Lưu ID của Tutor nếu có
      student_id: student_id,  // Lưu ID của Student nếu có
    });

    // Lưu tài liệu vào cơ sở dữ liệu
    await newDocument.save();

    // Trả về thông tin tài liệu đã upload và lưu vào MongoDB
    res.status(200).json({
      message: 'Document uploaded successfully',
      file: req.file,
      fileUrl: fileUrl,
      tutor_id: tutor_id,
      student_id: student_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading document', error: err });
  }
});

// Read (GET) - Lấy tất cả tài liệu từ MongoDB
router.get('/documents', async (req, res) => {
  try {
    const documents = await Document.find();  // Tìm tất cả tài liệu trong MongoDB
    res.status(200).json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching documents', error: err });
  }
});

// Read (GET) - Lấy thông tin một tài liệu theo ID
router.get('/documents/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);  // Tìm tài liệu theo ID
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching document', error: err });
  }
});

// Update (PUT) - Cập nhật tài liệu (thực tế sẽ thay thế tài liệu cũ)
router.put('/documents/:id', uploadDocuments.single('document'), async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);  // Tìm tài liệu cũ theo ID
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Xóa tài liệu cũ từ hệ thống nếu có
    const oldFilePath = path.join(__dirname, `../uploads/documents/${document.filename}`);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);  // Xóa tệp cũ
    }

    // Cập nhật tài liệu mới
    document.filename = req.file.filename;
    document.originalname = req.file.originalname;
    document.mimetype = req.file.mimetype;
    document.size = req.file.size;
    document.fileUrl = `/uploads/documents/${req.file.filename}`;

    // Lưu lại tài liệu mới vào MongoDB
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
});

// Delete (DELETE) - Xóa tài liệu
router.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);  // Tìm tài liệu theo ID
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Xóa tài liệu từ hệ thống
    const filePath = path.join(__dirname, `../uploads/documents/${document.filename}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);  // Xóa tệp khỏi hệ thống
    }

    // Xóa tài liệu khỏi MongoDB
    await document.remove();

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting document', error: err });
  }
});

module.exports = router;
