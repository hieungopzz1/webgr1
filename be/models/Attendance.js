const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  status: { type: String, enum: ["Present", "Absent"], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
}, { timestamps: true });

const Attendance = mongoose.model("Attendance", AttendanceSchema);
module.exports = Attendance;
