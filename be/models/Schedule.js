const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  date: { type: Date, required: true }, 
  // startTime: { type: String, required: true }, 
  // endTime: { type: String, required: true },
  // type: { 
  //   type: String, 
  //   enum: ["Online", "Offline"], 
  //   required: true 
  // }, 
  // location: { type: String }, 
  // meetingLink: { type: String } 
  slot: {
    type:Number,
    required: true,
    enum:[1,2,3,4,5,6]
  }
});



const Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports = Schedule;
