const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');  
const Tutor = require('../models/Tutor');  
const Student = require('../models/Student');  
const router = express.Router();

// API tạo tài khoản cho Tutor
router.post('/create-tutor-account', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await Tutor.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already exists.' });

    const newTutor = new Tutor({
      firstName,
      lastName,
      email,
      password, // Lưu mật khẩu thô
    });

    await newTutor.save();
    res.status(201).json({ message: 'Tutor account created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// API tạo tài khoản cho Student
router.post('/create-student-account', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await Student.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already exists.' });

    const newStudent = new Student({
      firstName,
      lastName,
      email,
      password, // Lưu mật khẩu thô
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student account created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
