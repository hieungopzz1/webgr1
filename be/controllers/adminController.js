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

const getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTutors = await Tutor.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalSchedules = await Schedule.countDocuments();

    const attendanceRecords = await Attendance.find();
    const presentCount = attendanceRecords.filter(a => a.status === "Present").length;
    const absentCount = attendanceRecords.filter(a => a.status === "Absent").length;

    const assignedStudentIds = await AssignStudent.distinct("student");

    const unassignedStudents = await Student.find({
      _id: { $nin: assignedStudentIds },
      role: "Student",
    }).select("_id student_ID firstName lastName email");

    const totalUnassignedStudents = unassignedStudents.length;
    const totalAssignedStudents = assignedStudentIds.length;


    const assignedTutorIds = await AssignTutor.distinct("tutor");

    const unassignedTutors = await Tutor.find({
      _id: { $nin: assignedTutorIds },
      role: "Tutor",
    }).select("_id firstName lastName email");

    const totalUnassignedTutors = unassignedTutors.length;
    const totalAssignedTutors = assignedTutorIds.length;


    const dashboardData = {
      totalStudents,
      totalTutors,
      totalClasses,
      presentCount,
      absentCount,
      totalUnassignedStudents, 
      unassignedStudents,     
      totalAssignedStudents,
      totalUnassignedTutors,
      totalAssignedTutors,
      totalSchedules
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

    let deletedUser = await Student.findById(id);
    if (deletedUser) {
      const blogs = await Blog.find({ student_id: id });
      if (blogs.length > 0) {
        await Blog.deleteMany({ student_id: id });
      }

      const documents = await Document.find({ student_id: id });
      if (documents.length > 0) {
        await Document.deleteMany({ student_id: id });
      }

      await Student.findByIdAndDelete(id);
      return res.status(200).json({ message: "Student and related data deleted", deletedUser });
    }

    deletedUser = await Tutor.findById(id);
    if (deletedUser) {
      const blogs = await Blog.find({ tutor_id: id });
      if (blogs.length > 0) {
        await Blog.deleteMany({ tutor_id: id });
      }
      const documents = await Document.find({ tutor_id: id });
      if (documents.length > 0) {
        await Document.deleteMany({ tutor_id: id });
      }
      await Tutor.findByIdAndDelete(id);
      return res.status(200).json({ message: "Tutor and related data deleted", deletedUser });
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAccount,
  deleteUser,
  getAllUsers,
  getUserById,
  getAdminDashboard,
};