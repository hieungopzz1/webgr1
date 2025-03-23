const AssignStudent = require("../models/AssignStudent");
const Student = require("../models/Student");
const Class = require("../models/Class");

const assignStudent = async (req, res) => {
  try {
    const { studentIds, classId, adminId } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class không tồn tại!" });
    }
    const validStudents = await Student.find({
      _id: { $in: studentIds },
      role: "Student",
    }).select("_id");

    const validStudentIds = validStudents.map((s) => s._id.toString());

    const invalidStudentIds = studentIds.filter(
      (id) => !validStudentIds.includes(id)
    );
    if (invalidStudentIds.length > 0) {
      return res.status(400).json({
        message: "Some IDs are not valid Students!",
        invalidIds: invalidStudentIds,
      });
    }

    const existingAssignments = await AssignStudent.find({
      class: classId,
    }).select("student");
    const assignedStudentIds = existingAssignments.map((as) =>
      as.student.toString()
    );

    const newStudents = validStudentIds.filter(
      (id) => !assignedStudentIds.includes(id)
    );

    if (newStudents.length === 0) {
      return res
        .status(400)
        .json({
          message: "Students have already been assigned to this class!",
        });
    }

    const assignments = newStudents.map((studentId) => ({
      student: studentId,
      class: classId,
      assignedBy: adminId,
    }));

    await AssignStudent.insertMany(assignments);

    res.status(201).json({
      message: "Students assigned to class successfully!",
      assigned: newStudents.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find(
      {},
      "student_ID firstName lastName email avatar"
    );
    res.status(200).json({ message: "Success", students });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving students", error: error.message });
  }
};
const getAssignStudentInClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const students = await AssignStudent.find({ class: classId }).populate(
      "student"
    );

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//lya sinh vien theo major
const getStudentsByMajor = async (req, res) => {
  try {
    const { major } = req.query;

    if (!major) {
      return res.status(400).json({ message: "Vui lòng cung cấp major!" });
    }

    // Lọc danh sách sinh viên theo major
    const students = await Student.find({ major });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeStudent = async (req, res) => {
  try {
    const { studentId, classId } = req.body;

    const deleted = await AssignStudent.findOneAndDelete({
      student: studentId,
      class: classId,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Sinh viên này không tồn tại trong lớp!" });
    }

    res.status(200).json({ message: "Đã xóa sinh viên khỏi lớp thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const removeAllStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    const deleted = await AssignStudent.deleteMany({ class: classId });

    res
      .status(200)
      .json({
        message: `Đã xóa ${deleted.deletedCount} sinh viên khỏi lớp thành công!`,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  assignStudent,
  getAllStudents,
  getAssignStudentInClass,
  getStudentsByMajor,
  removeAllStudents,
  removeStudent,
};
