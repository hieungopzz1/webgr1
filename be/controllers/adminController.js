const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Meeting = require("../models/Meeting");
const Class = require("../models/Class");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
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
      "firstName lastName email role avatar"
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

const assignTutor = async (req, res) => {
  try {
    const { name, tutor_id, student_id, assgined_by } = req.body;
    if (!name || !tutor_id || !student_id || !assgined_by) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const tutor = await Tutor.findById(tutor_id);
    if (!tutor) {
      return res.status(400).json({ message: "Tutor not found" });
    }
    const students = await Student.find({ _id: { $in: student_id } });
    if (students.length !== student_id.length) {
      return res.status(400).json({ message: "Student not found" });
    }
    const existingClass = await Class.findOne({ name });
    if (existingClass)
      return res.status(400).json({ message: "Class already exists" });
    const newAssign = new Class({ name, tutor_id, student_id, assgined_by });
    await newAssign.save();
    res.status(201).json({ message: "Class created successfully", newAssign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAssign = async (req, res) => {
  try {
    const assigns = await Class.find(
      {},
      "name tutor_id student_id assgined_by"
    );
    res.status(200).json({ assigns });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssignById = async (req, res) => {
  try {
    const { assignId } = req.params;
    const assign = await Class.findById(assignId);
    if (!assign) {
      return res.status(404).json({ message: "Assign not found" });
    }
    res.status(200).json({ assign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateAssign = async (req, res) => {
  try {
    const { assignId } = req.params;
    const updateData = req.body;
    if (!updateData.name) {
      return res.status(400).json({ message: "Class name is required" });
    }

    const updatedAssign = await Class.findByIdAndUpdate(assignId, updateData, {
      new: true,
    });
    if (!updatedAssign) {
      return res.status(404).json({ message: "Assign not found" });
    }

    res
      .status(200)
      .json({ message: "Class updated successfully", assign: updatedAssign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAssign = async (req, res) => {
  try {
    const { assignId } = req.params;

    const deletedAssign = await Class.findByIdAndDelete(assignId);

    if (!deletedAssign) {
      return res.status(404).json({ message: "Assign not found" });
    }

    res.status(200).json({ message: "Assign deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMeeting = async (req, res) => {
  try {
    const { title, created_by, type, link, location, date } = req.body;

    if (!title || !created_by || !type || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (type === "online" && !link) {
      return res
        .status(400)
        .json({ message: "Online meeting must have a link" });
    }
    if (type === "offline" && !location) {
      return res
        .status(400)
        .json({ message: "Offline meeting must have a location" });
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
    res
      .status(201)
      .json({ message: "Meeting created successfully", newMeeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { title, type, link, location, date } = req.body;

    if (!title || !type || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { title, type, link, location, date },
      { new: true }
    );

    if (!updatedMeeting)
      return res.status(404).json({ message: "Meeting not found" });

    res
      .status(200)
      .json({ message: "Meeting updated successfully", updatedMeeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const deletedMeeting = await Meeting.findByIdAndDelete(meetingId);

    if (!deletedMeeting)
      return res.status(404).json({ message: "Meeting not found" });

    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAccount,
  assignTutor,
  getAllAssign,
  deleteUser,
  getAllUsers,
  updateAssign,
  deleteAssign,
  createMeeting,
  deleteMeeting,
  updateMeeting,
  getUserById,
  getAssignById,
};
