const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  assgined_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    default: null,
  },
  student_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  ],
  name: {
    type: String,
    required: true,
    unique: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Class", ClassSchema);
