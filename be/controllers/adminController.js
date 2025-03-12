const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Assignment = require("../models/Assignment");
const Meeting = require("../models/Meeting");
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

const getAllUsers = async (req, res) => {
  try {
    const students = await Student.find({}, "firstName lastName email role avatar");
    const tutors = await Tutor.find({}, "firstName lastName email role avatar");

    const users = [...students, ...tutors];

    res.status(200).json({ message: "Success", users });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error: error.message });
  }
}



const deleteUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    if (!["Student", "Tutor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    let deletedUser;
    if (role === "Student") {
      deletedUser = await Student.findByIdAndDelete(id);
    } else if (role === "Tutor") {
      deletedUser = await Tutor.findByIdAndDelete(id);
    }

    if (!deletedUser) {
      return res.status(404).json({ message: `${role} not found` });
    }

    res.status(200).json({ message: `${role} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const addClass = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existingClass = await Class.findOne({ name });
    if(existingClass) return res.status(400).json({ message: "Class already exists" });
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

const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const updateData = req.body;

    const updatedClass = await Class.findByIdAndUpdate(classId, updateData, { new: true });

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ message: "Class updated successfully", class: updatedClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const deletedClass = await Class.findByIdAndDelete(classId);

    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ message: "Class deleted successfully" });
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

const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { new_tutor_id } = req.body;

    if (!new_tutor_id) {
      return res.status(400).json({ message: "New Tutor ID is required" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.tutor_id = new_tutor_id;
    await assignment.save();

    res.status(200).json({ message: "Assignment updated successfully", assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createMeeting = async (req, res) => {
  try {
    const { title, created_by, type, link, location, date } = req.body;

    if (type === "online" && !link) {
      return res.status(400).json({ message: "Online meeting must have a link" });
    }
    if (type === "offline" && !location) {
      return res.status(400).json({ message: "Offline meeting must have a location" });
    }

    const newMeeting = new Meeting({
      title,
      created_by,
      type,
      link,
      location,
      date,
    });

    await newMeeting.save();
    res.status(201).json({ message: "Meeting created successfully", newMeeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { title, type, link, location, date } = req.body;

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { title, type, link, location, date },
      { new: true }
    );

    if (!updatedMeeting) return res.status(404).json({ message: "Meeting not found" });

    res.status(200).json({ message: "Meeting updated successfully", updatedMeeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const deletedMeeting = await Meeting.findByIdAndDelete(meetingId);

    if (!deletedMeeting) return res.status(404).json({ message: "Meeting not found" });

    res.status(200).json({ message: "Meeting deleted successfully" });
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
  updateClass,
  deleteClass,
  updateAssignment,
  deleteAssignment,
  createMeeting,
  deleteMeeting,
  updateMeeting,
};
