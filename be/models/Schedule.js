const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  date: { type: Date, required: true }, 
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true } 
});

const Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports = Schedule;
