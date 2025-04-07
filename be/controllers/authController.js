const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");
require("dotenv").config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user =
      (await Student.findOne({ email })) ||
      (await Tutor.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1d" } 
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { role, username, password, firstName, lastName, email, major, student_ID } = req.body;
    
    let existingUser = null;
    if (role === "Admin") {
      existingUser = await Admin.findOne({ username });
    } else if (role === "Tutor") {
      existingUser = await Tutor.findOne({ username });
    } else if (role === "Student") {
      existingUser = await Student.findOne({ username });
    } else {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    let newUser;
    // Create user based on role
    if (role === "Admin") {
      newUser = new Admin({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
      });
    } else if (role === "Tutor") {
      newUser = new Tutor({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
      });
    } else {
      newUser = new Student({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        major,
        student_ID,
      });
    }
    
    await newUser.save();

    // Create welcome notification
    const welcomeNotification = new Notification({
      title: "Welcome to eTutoring Platform",
      content: `Welcome ${firstName} ${lastName}! We're excited to have you join our eTutoring platform. If you have any questions, please contact the administrator.`,
      senderId: "system",
      recipientIds: [newUser._id.toString()],
    });
    
    await welcomeNotification.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { login, getMe, register };
