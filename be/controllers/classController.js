const Class = require('../models/Class')
const AssignStudent = require('../models/AssignStudent')
const AssignTutor = require('../models/AssignTutor')


//quan ly lop hoc
const createClass = async (req, res) => {
  try {
    const { class_name, major, subject } = req.body;
    if (!class_name || !major || !subject) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingClass = await Class.findOne({ class_name });
    if (existingClass) {
      return res.status(400).json({ message: "Class already exists" });
    }

    const newClass = new Class({ class_name, major, subject });
    await newClass.save();

    const io = req.app.get("socketio");
    io.emit("updateDashboard", { message: "A new class has been added!", class: newClass });

    res.status(201).json({ message: "Class created successfully", class: newClass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//lay ra cac lop chua duoc phan
const getUnassignedClasses = async (req, res) => {
  try {
    // Lấy danh sách các class đã có sinh viên được gán
    const assignedClassIds = await AssignStudent.distinct("class") && await AssignTutor.distinct("class");

    // Lọc ra các class chưa được phân bổ (không có trong danh sách assignedClassIds)
    const unassignedClasses = await Class.find({
      _id: { $nin: assignedClassIds }
    }).select("_id class_name major subject");

    res.status(200).json({messages: "Successfully",unassignedClasses});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { class_name, major, subject } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(classId, { class_name, major, subject }, { new: true });
    res.status(200).json({ message: "Class updated successfully", updatedClass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const deletedClass = await Class.findByIdAndDelete(classId);
    res.status(200).json({ message: "Class deleted successfully", deletedClass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;
    const classs = await Class.findById(classId);
    res.status(200).json(classs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getUsersInClass  = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    const assignedStudents = await AssignStudent.find({ class: classId }).populate("student", "_id student_ID firstName lastName");

    const assignedTutors = await AssignTutor.find({ class: classId }).populate("tutor", "_id");

    const students = assignedStudents.map((entry) => entry.student);
    const tutors = assignedTutors.map((entry) => entry.tutor);

    res.status(200).json({
      classId: classData._id,
      className: classData.name,
      students,
      tutors,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {createClass, getAllClasses,updateClass,deleteClass, getClassById,getUsersInClass,getUnassignedClasses}