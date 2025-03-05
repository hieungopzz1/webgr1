const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  assigned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  assigned_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Assignment", AssignmentSchema);
