const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  student_ID: { type: String, required: true, unique: true }, 
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true },
  role: { type: String, default: "Student" },
  major: { type: String, required: true }, 
  avatar: { type: String }
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
