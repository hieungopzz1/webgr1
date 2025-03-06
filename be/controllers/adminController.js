// backend/controllers/adminController.js
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const createAccount = async (req, res) => {
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
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials.' });

    if (password !== admin.password) { 
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createAccount, login };
