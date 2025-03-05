const express = require('express');
const jwt = require('jsonwebtoken');
const Tutor = require('../models/Tutor');
const router = express.Router();

// API tạo tài khoản Tutor
router.post('/create-account', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await Tutor.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already exists.' });

    const newTutor = new Tutor({
      firstName,
      lastName,
      email,
      password, 
    });

    await newTutor.save();
    res.status(201).json({ message: 'Tutor account created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// API đăng nhập Tutor
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const tutor = await Tutor.findOne({ email });
    if (!tutor) return res.status(400).json({ message: 'Invalid credentials.' });

    if (password !== tutor.password) {  
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: tutor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: tutor });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
