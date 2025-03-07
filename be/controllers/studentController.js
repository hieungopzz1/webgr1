const Class = require("../models/Class");
const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");

const enrollStudentInClass = async (req, res) => {
  try {
    const { student_id } = req.body;
    const { classId } = req.params;

    if (!student_id) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: "Class not found" });

    const student = await Student.findById(student_id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Kiểm tra xem student đã enroll chưa
    const alreadyEnrolled = await Enrollment.findOne({ class_id: classId, student_id });
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Student is already enrolled in this class" });
    }

    // Tạo bản ghi mới trong bảng Enrollment
    const newEnrollment = new Enrollment({
      class_id: classId,
      student_id,
    });

    await newEnrollment.save();

    res.status(200).json({ message: "Student enrolled successfully", newEnrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { enrollStudentInClass };
