const mongoose = require('mongoose');

// Định nghĩa Schema cho User
const TutorSchema = new mongoose.Schema({

  createdAt: { type: Date, default: Date.now },
});

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
const Tutor = mongoose.model('Tutor', TutorSchema);

module.exports = Tutor;
