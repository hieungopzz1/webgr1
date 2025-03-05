const mongoose = require('mongoose');

// Định nghĩa Schema cho Admin
const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
