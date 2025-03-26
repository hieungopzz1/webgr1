const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  student_ID: { type: String, required: true, unique: true }, // Giữ nguyên tên
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Student" },
  major: { type: String, required: true },
  avatar: { type: String },
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class" } // Liên kết với lớp học
}, { timestamps: true });

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
