const mongoose = require('mongoose');

// Định nghĩa Schema cho Tutor
const TutorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Tutor" } ,
  avatar: { type: String }
});

const Tutor = mongoose.model('Tutor', TutorSchema);

module.exports = Tutor;
