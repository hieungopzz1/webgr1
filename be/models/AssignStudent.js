const mongoose = require("mongoose");

const AssignStudentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, 
  assignedAt: { type: Date, default: Date.now }
});

const AssignStudent = mongoose.model("AssignStudent", AssignStudentSchema);
module.exports = AssignStudent;
