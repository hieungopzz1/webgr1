const mongoose = require('mongoose');

// Định nghĩa Schema cho Student
const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
