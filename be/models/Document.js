const mongoose = require('mongoose');

// Định nghĩa schema cho tài liệu
const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalname: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null,
  },
  tutor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      default: null,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: null,
  },
  document_type: {
    type: String,
    enum: ["assignment", "submission"],
    required: true,
  },
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
