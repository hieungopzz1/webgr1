const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Document = require("../models/Document");
const Blog = require("../models/Blog");
const Class = require("../models/Class");
const Schedule = require("../models/Schedule");
const Attendance = require("../models/Attendance");
const AssignStudent = require("../models/AssignStudent");
const AssignTutor = require("../models/AssignTutor");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");


const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, student_ID, major } = req.body;
    const avatar = req.file ? `/uploads/avatar/${req.file.filename}` : null;
    if (!["Student", "Tutor", "Admin"].includes(role)) {
      if (avatar) removeImage(avatar);
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser =
      (await Student.findOne({ email })) ||
      (await Tutor.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === "Student") {
      user = new Student({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
        student_ID,
        major
      });
    } else if (role === "Tutor") {
      user = new Tutor({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
      });
    } else if (role === "Admin") {
      user = new Admin({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
      });
    }

    await user.save();

    const io = req.app.get("socketio");
    io.emit("updateDashboard", { message: "A new user is added!", user: user });

    res
      .status(201)
      .json({ user, message: "User created successfully", avatar });
  } catch (error) {
    if (req.file) removeImage(`/uploads/avatar/${req.file.filename}`);
    res.status(500).json({ error: error.message });
  }
};

const removeImage = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.error("Error deleting image:", err);
  });
};

const getAllUsers = async (req, res) => {
  try {
    const students = await Student.find(
      {},
      "firstName lastName email role avatar student_ID"
    );
    const tutors = await Tutor.find({}, "firstName lastName email role avatar");

    const users = [...students, ...tutors];

    res.status(200).json({ message: "Success", users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving users", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user =
      (await Student.findById(id)) ||
      (await Tutor.findById(id)) ||
      (await Admin.findById(id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Xóa Student
    const deletedStudent = await Student.findOneAndDelete({ _id: id });
    if (deletedStudent) {
      return res.status(200).json({ message: "Student and related data deleted", deletedUser: deletedStudent });
    }

    // Xóa Tutor
    const deletedTutor = await Tutor.findOneAndDelete({ _id: id });
    if (deletedTutor) {
      return res.status(200).json({ message: "Tutor and related data deleted", deletedUser: deletedTutor });
    }

    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createAccount,
  deleteUser,
  getAllUsers,
  getUserById,
};