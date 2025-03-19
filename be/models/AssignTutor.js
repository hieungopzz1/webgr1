const mongoose = require("mongoose");

const AssignTutorSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, 
  assignedAt: { type: Date, default: Date.now }
});

const AssignTutor = mongoose.model("AssignTutor", AssignTutorSchema);
module.exports = AssignTutor;
