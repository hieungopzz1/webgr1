const express = require('express');
// const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');  
const router = express.Router();

// API tạo tài khoản cho Tutor
router.post("/create-account", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// API đăng nhập cho Admin, Tutor, và Student
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra xem người dùng là Admin, Tutor hay Student
    let user;
    if (email.includes('@example.com')) {
      user = await Admin.findOne({ email }); // Admin
    } else if (email.includes('@tutor.com')) {
      user = await Tutor.findOne({ email }); // Tutor
    } else {
      user = await Student.findOne({ email }); // Student
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // So sánh mật khẩu thô
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
