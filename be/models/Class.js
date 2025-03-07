const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  schedule: [
    {
      day: String, // Ví dụ: "Monday", "Tuesday"
      time: String, // Ví dụ: "14:00 - 16:00"
    },
  ],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

module.exports = mongoose.model("Class", ClassSchema);
