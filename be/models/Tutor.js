const mongoose = require("mongoose");

const TutorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Tutor" },
  avatar: { type: String },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }] // Liên kết với danh sách lớp dạy
}, { timestamps: true });

const Tutor = mongoose.model("Tutor", TutorSchema);
module.exports = Tutor;
