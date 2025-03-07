const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  enrolled_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
