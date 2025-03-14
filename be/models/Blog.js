const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    default: null,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: null,
  },
  image: {
    type: String,
  },
});

module.exports = mongoose.model("Blog", BlogSchema);
