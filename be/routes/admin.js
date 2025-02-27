const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const isAdmin = require('../middleware/admin'); // Import middleware kiểm tra quyền admin
const router = express.Router();

// API để admin tạo tài khoản cho tutor và student
router.post('/create-account', isAdmin, async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Kiểm tra xem role có phải là 'tutor' hoặc 'student' không
  if (!['tutor', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Role must be either tutor or student' });
  }

  try {
    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới (tutor hoặc student)
    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role,
    });

    // Lưu người dùng mới vào cơ sở dữ liệu
    await newUser.save();
    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
