const mongoose = require('mongoose');

// Định nghĩa Schema cho User
const StudentSchema = new mongoose.Schema({

  createdAt: { type: Date, default: Date.now },
});

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
