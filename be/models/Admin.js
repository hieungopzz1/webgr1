const mongoose = require('mongoose');

// Định nghĩa Schema cho Admin
const AdminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, default: "Admin" } 

});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
