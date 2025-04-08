const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, student_ID, major } = req.body;
    const avatar = req.file ? `/uploads/avatar/${req.file.filename}` : undefined;

    if (!firstName || !lastName || !email || !password || !role) {
      if (avatar) removeImage(avatar);
      return res.status(400).json({ message: "Missing required fields" });
    }

    const validRoles = ["Student", "Tutor", "Admin"];
    if (!validRoles.includes(role)) {
      if (avatar) removeImage(avatar);
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingId = await Student.findOne({ student_ID: student_ID });
    if (existingId) {
      if (avatar) removeImage(avatar);
      return res.status(400).json({ message: "Student ID already registered" });
    }


    const existingUser = await Promise.all([
      Student.findOne({ email }),
      Tutor.findOne({ email }),
      Admin.findOne({ email }),
    ]).then(results => results.find(user => user !== null));

    if (existingUser) {
      if (avatar) removeImage(avatar);
      return res.status(400).json({ message: "Email already registered" });
    }

    // const validatePass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    // if (!validatePass.test(password)) {
    //   if (avatar) removeImage(avatar);
    //   return res.status(400).json({ message: "Password must be 6-20 characters, include at least one number, one lowercase, and one uppercase letter" });
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === "Student") {
      if (!student_ID || !major) {
        if (avatar) removeImage(avatar);
        return res.status(400).json({ message: "Student ID and major are required for Student role" });
      }
      user = new Student({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
        student_ID,
        major,
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
    if (io) {
      io.emit("updateDashboard", { message: "A new user is added!", user });
    }

    res.status(201).json({
      user: {
        id: user._id,
        firstName,
        lastName,
        email,
        role,
        avatar,
      },
      message: "User created successfully",
    });
  } catch (error) {
    if (req.file) removeImage(`/uploads/avatar/${req.file.filename}`);
    console.error("Error creating account:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
      return res.status(200).json({
        message: "Student and related data deleted",
        deletedUser: deletedStudent,
      });
    }

    // Xóa Tutor
    const deletedTutor = await Tutor.findOneAndDelete({ _id: id });
    if (deletedTutor) {
      return res.status(200).json({
        message: "Tutor and related data deleted",
        deletedUser: deletedTutor,
      });
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
