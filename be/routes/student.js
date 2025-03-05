const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const router = express.Router();

// API tạo tài khoản Student
router.post('/create-account', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await Student.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already exists.' });

    const newStudent = new Student({
      firstName,
      lastName,
      email,
      password, 
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student account created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get("/", async (req, res) => {
  try {
    const students = await Student.find(); // Lấy tất cả người dùng từ DB
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});
// API đăng nhập Student
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: 'Invalid credentials.' });

    if (password !== student.password) { 
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: student });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
