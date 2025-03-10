const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Assignment = require("../models/Assignment");
const Class = require("../models/Class");
const bcrypt = require("bcrypt");

const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null; // Lấy đường dẫn ảnh

    if (!["Student", "Tutor", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Kiểm tra email đã tồn tại chưa
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
      user = new Student({ firstName, lastName, email, password: hashedPassword, avatar });
    } else if (role === "Tutor") {
      user = new Tutor({ firstName, lastName, email, password: hashedPassword, avatar });
    } else if (role === "Admin") {
      user = new Admin({ firstName, lastName, email, password: hashedPassword, avatar });
    }

    await user.save();
    res.status(201).json({ user, message: "User created successfully", avatar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all usuers
const getAllUsers = async (req, res) => {
  try {
    // Lấy tất cả Student và Tutor
    const students = await Student.find({}, "firstName lastName email role avatar");
    const tutors = await Tutor.find({}, "firstName lastName email role avatar");

    // Gộp danh sách lại
    const users = [...students, ...tutors];

    res.status(200).json({ message: "Success", users });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error: error.message });
  }
}



//delete user
const deleteUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    // Kiểm tra role hợp lệ
    if (!["Student", "Tutor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Xóa user theo role
    let deletedUser;
    if (role === "Student") {
      deletedUser = await Student.findByIdAndDelete(id);
    } else if (role === "Tutor") {
      deletedUser = await Tutor.findByIdAndDelete(id);
    }

    // Kiểm tra nếu user không tồn tại
    if (!deletedUser) {
      return res.status(404).json({ message: `${role} not found` });
    }

    res.status(200).json({ message: `${role} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



//tạo lớp để thêm sinh viên và giảng viên
const addClass = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newClass = new Class({ name, description });
    await newClass.save();
    res.status(201).json({ message: "Class created successfully", newClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("tutors").populate("students");
    res.status(200).json({ classes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const assignTutorToClass = async (req, res) => {
  try {
    const { tutor_id, assigned_by } = req.body; 
    const { classId } = req.params;

    if (!tutor_id || !assigned_by) {
      return res.status(400).json({ message: "Assigned_by (Admin ID) and Tutor ID are required" });
    }

    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: "Class not found" });

    const tutor = await Tutor.findById(tutor_id);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    const newAssignment = new Assignment({
      assigned_by, 
      tutor_id,
      class_id: classId, 
    });

    await newAssignment.save();

    if (!classObj.tutors) {
      classObj.tutors = []; 
    }

    classObj.tutors.push(tutor_id);
    await classObj.save();

    res.status(200).json({ message: "Tutor assigned successfully", classObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { assignTutorToClass };


module.exports = {
  createAccount,
  addClass,
  assignTutorToClass,
  getAllClasses,
  deleteUser,
  getAllUsers,
};
