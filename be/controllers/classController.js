const Class = require("../models/Class");
const Tutor = require("../models/Tutor");
const Schedule = require("../models/Schedule");
const AssignStudent = require("../models/AssignStudent");

//quan ly lop hoc

// tao moi mot lop hoc
const createClass = async (req, res) => {
  try {
    const { class_name, major, subject, tutor_id } = req.body;

    if (!class_name || !major || !subject || !tutor_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingClass = await Class.findOne({ class_name });
    if (existingClass) {
      return res.status(400).json({ message: "Class already exists" });
    }

    const tutor = await Tutor.findById(tutor_id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const newClass = new Class({ class_name, major, subject, tutor: tutor_id });
    await newClass.save();

    const io = req.app.get("socketio");
    io.emit("updateDashboard", {
      message: "A new class has been added!",
      class: newClass,
    });

    res
      .status(201)
      .json({ message: "Class created successfully", class: newClass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//lay ra cac lop chua co student
const getClassesWithoutStudents = async (req, res) => {
  try {
    const allClasses = await Class.find().select("_id class_name");

    const assignedClassIds = await AssignStudent.distinct("class");

    const assignedClassIdsStr = assignedClassIds.map(id => id.toString());

    const unassignedClasses = allClasses.filter(cls => 
      !assignedClassIdsStr.includes(cls._id.toString())
    );

    res.json({
      totalUnassignedClasses: unassignedClasses.length,
      unassignedClasses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { class_name, major, subject, tutor_id } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { class_name, major, subject, tutor: tutor_id },
      { new: true }
    );
    const io = req.app.get("socketio");
    io.emit("updateDashboard", {
      message: "Class is updated!",
      updatedClass: updatedClass,
    });
    res
      .status(200)
      .json({ message: "Class updated successfully", updatedClass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    await Schedule.deleteMany({ class: classId });

    await AssignStudent.deleteMany({ class: classId });

    await Class.findByIdAndDelete(classId);

    const io = req.app.get("socketio");
    io.emit("updateDashboard", { message: `Class ${classData.class_name} deleted!` });

    res.status(200).json({ message: "Class and related assignments deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;
    const classs = await Class.findById(classId);
    res.status(200).json(classs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsersInClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    const assignedStudents = await AssignStudent.find({
      class: classId,
    }).populate("student", "_id student_ID firstName lastName");

    const students = assignedStudents.map((entry) => entry.student);

    res.status(200).json({
      classId: classData._id,
      className: classData.name,
      students,
      tutor: classData.tutor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createClass,
  getAllClasses,
  updateClass,
  deleteClass,
  getClassById,
  getUsersInClass,
  getClassesWithoutStudents,
};
