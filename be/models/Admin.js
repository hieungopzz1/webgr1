const mongoose = require('mongoose');

// Định nghĩa Schema cho User
const AdminSchema = new mongoose.Schema({

  createdAt: { type: Date, default: Date.now },
});

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
