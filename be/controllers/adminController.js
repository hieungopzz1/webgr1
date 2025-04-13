const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Document = require("../models/Document");
const Blog = require("../models/Blog");
const Class = require("../models/Class");
const Schedule = require("../models/Schedule");
const Attendance = require("../models/Attendance");
const AssignStudent = require("../models/AssignStudent");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");


const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, student_ID, tutor_ID, major } = req.body;
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
      const existingStudentID = await Student.findOne({ student_ID });
      if (existingStudentID) {
        if (avatar) removeImage(avatar);
        return res.status(400).json({ message: "Student ID already exists" });
      }

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
      const existingTutorID = await Tutor.findOne({ tutor_ID });
      if (existingTutorID) {
        if (avatar) removeImage(avatar);
        return res.status(400).json({ message: "Tutor ID already exists" });
      }

      user = new Tutor({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
        major,
        tutor_ID
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
    io.emit("updateDashboard", { message: "A new user is added!", user });

    return res.status(201).json({
      user,
      message: "User created successfully",
      avatar
    });

  } catch (error) {
    if (req.file) removeImage(`/uploads/avatar/${req.file.filename}`);
    return res.status(500).json({ error: error.message });
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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, student_ID, tutor_ID, major } = req.body;
    const avatar = req.file ? `/uploads/avatar/${req.file.filename}` : undefined;
    
    // Tìm loại user cần cập nhật
    let user = await Student.findById(id) || await Tutor.findById(id) || await Admin.findById(id);
    
    if (!user) {
      if (avatar) removeImage(avatar); // Xóa ảnh đã upload nếu không tìm thấy user
      return res.status(404).json({ message: "User not found" });
    }
    
    // Kiểm tra xem email có bị trùng không (nếu đang thay đổi email)
    if (email && email !== user.email) {
      const existingUserWithEmail = 
        (await Student.findOne({ email, _id: { $ne: id } })) ||
        (await Tutor.findOne({ email, _id: { $ne: id } })) ||
        (await Admin.findOne({ email, _id: { $ne: id } }));
      
      if (existingUserWithEmail) {
        if (avatar) removeImage(avatar);
        return res.status(400).json({ message: "Email already registered with another account" });
      }
    }
    
    // Chuẩn bị dữ liệu cập nhật
    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;
    
    // Cập nhật mật khẩu nếu được cung cấp
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Xử lý trường hợp Student
    if (user.role === "Student") {
      // Kiểm tra ID sinh viên nếu đang được cập nhật
      if (student_ID && student_ID !== user.student_ID) {
        const existingStudentID = await Student.findOne({ 
          student_ID,
          _id: { $ne: id }
        });
        
        if (existingStudentID) {
          if (avatar) removeImage(avatar);
          return res.status(400).json({ message: "Student ID already exists" });
        }
        
        updateData.student_ID = student_ID;
      }
      
      if (major) updateData.major = major;
      
      // Cập nhật Student
      await Student.findByIdAndUpdate(id, updateData, { new: true });
      const updatedUser = await Student.findById(id);
      
      return res.status(200).json({
        message: "Student updated successfully",
        user: updatedUser
      });
    }
    
    // Xử lý trường hợp Tutor
    if (user.role === "Tutor") {
      // Kiểm tra ID tutor nếu đang được cập nhật
      if (tutor_ID && tutor_ID !== user.tutor_ID) {
        const existingTutorID = await Tutor.findOne({ 
          tutor_ID,
          _id: { $ne: id }
        });
        
        if (existingTutorID) {
          if (avatar) removeImage(avatar);
          return res.status(400).json({ message: "Tutor ID already exists" });
        }
        
        updateData.tutor_ID = tutor_ID;
      }
      
      if (major) updateData.major = major;
      
      // Cập nhật Tutor
      await Tutor.findByIdAndUpdate(id, updateData, { new: true });
      const updatedUser = await Tutor.findById(id);
      
      return res.status(200).json({
        message: "Tutor updated successfully",
        user: updatedUser
      });
    }
    
    // Xử lý trường hợp Admin
    if (user.role === "Admin") {
      // Cập nhật Admin
      await Admin.findByIdAndUpdate(id, updateData, { new: true });
      const updatedUser = await Admin.findById(id);
      
      return res.status(200).json({
        message: "Admin updated successfully",
        user: updatedUser
      });
    }
    
    // Nếu không phải loại user nào đã biết
    if (avatar) removeImage(avatar);
    return res.status(400).json({ message: "Invalid user role" });
    
  } catch (error) {
    if (req.file) removeImage(`/uploads/avatar/${req.file.filename}`);
    return res.status(500).json({ error: error.message });
  }
};

// Lọc user theo role
const filterUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    
    if (!role || !["Student", "Tutor", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role parameter" });
    }
    
    let users = [];
    
    if (role === "Student") {
      users = await Student.find({}, "firstName lastName email role avatar student_ID major");
    } else if (role === "Tutor") {
      users = await Tutor.find({}, "firstName lastName email role avatar tutor_ID major");
    } else if (role === "Admin") {
      users = await Admin.find({}, "firstName lastName email role avatar");
    }
    
    res.status(200).json({ 
      message: "Users filtered by role",
      count: users.length,
      users 
    });
  } catch (error) {
    res.status(500).json({ message: "Error filtering users", error: error.message });
  }
};

// Lọc user theo major
const filterUsersByMajor = async (req, res) => {
  try {
    const { major } = req.query;
    
    if (!major) {
      return res.status(400).json({ message: "Major parameter is required" });
    }
    
    const students = await Student.find(
      { major: { $regex: new RegExp(major, "i") } },
      "firstName lastName email role avatar student_ID major"
    );
    
    const tutors = await Tutor.find(
      { major: { $regex: new RegExp(major, "i") } },
      "firstName lastName email role avatar tutor_ID major"
    );
    
    const users = [...students, ...tutors];
    
    res.status(200).json({ 
      message: "Users filtered by major",
      count: users.length,
      users 
    });
  } catch (error) {
    res.status(500).json({ message: "Error filtering users", error: error.message });
  }
};

// Lọc user theo cả role và major
const filterUsersByRoleAndMajor = async (req, res) => {
  try {
    const { role, major } = req.query;
    
    if (!role || !["Student", "Tutor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role parameter" });
    }
    
    if (!major) {
      return res.status(400).json({ message: "Major parameter is required" });
    }
    
    let users = [];
    
    if (role === "Student") {
      users = await Student.find(
        { major: { $regex: new RegExp(major, "i") } },
        "firstName lastName email role avatar student_ID major"
      );
    } else if (role === "Tutor") {
      users = await Tutor.find(
        { major: { $regex: new RegExp(major, "i") } },
        "firstName lastName email role avatar tutor_ID major"
      );
    }
    
    res.status(200).json({ 
      message: `${role}s filtered by major: ${major}`,
      count: users.length,
      users 
    });
  } catch (error) {
    res.status(500).json({ message: "Error filtering users", error: error.message });
  }
};

module.exports = {
  createAccount,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  filterUsersByRole,
  filterUsersByMajor,
  filterUsersByRoleAndMajor
};