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
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
