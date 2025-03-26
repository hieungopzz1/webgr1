const AssignStudent = require("../models/AssignStudent");
const Student = require("../models/Student");
const Class = require("../models/Class");
const sendEmailAllocation = require("../services/emailService");

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

    const io = req.app.get("socketio");
     io.emit("updateDashboard", { message: "Successfully!", assignments: assignments });

    // Gửi email thông báo
    const studentData = await Student.find({ _id: { $in: newStudents } }, "firstName lastName email");

    // Kiểm tra nếu danh sách học sinh rỗng
    if (!studentData.length) {
      return res.status(404).json({ error: "Không tìm thấy học sinh nào với danh sách ID đã cung cấp!" });
    }

    for (const student of studentData) {
      const emailContent = `Xin chào ${student.firstName} ${student.lastName},\n\nBạn đã được phân bổ vào lớp ${classData.class_name}.\nHãy kiểm tra hệ thống để biết thêm chi tiết.`;

      try {
        await sendEmailAllocation(student.email, "Thông báo phân bổ lớp học", emailContent);
        console.log(`✅ Email sent to: ${student.email}`);
      } catch (error) {
        console.error(`❌ Lỗi khi gửi email cho ${student.email}:`, error);
        return res.status(500).json({ error: `Lỗi khi gửi email cho ${student.email}` });
      }
    }

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
    const students = await AssignStudent.find({ class: classId }).populate("student");

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
      return res.status(400).json({ message: "Major is required for search" });
    }

    const students = await Student.find({ major: { $regex: new RegExp(major, "i") } })
      .select("firstName lastName email major");

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this major" });
    }

    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

    // Lấy thông tin sinh viên để gửi email thông báo
    const student = await Student.findById(studentId);
    const classData = await Class.findById(classId);

    if (student && classData) {
      const emailContent = `Xin chào ${student.firstName} ${student.lastName},\n\nBạn đã bị xóa khỏi lớp ${classData.class_name}.\nNếu có thắc mắc, vui lòng liên hệ với quản trị viên.`;

      try {
        await sendEmailAllocation(student.email, "Thông báo xóa khỏi lớp học", emailContent);
        console.log(`✅ Email sent to: ${student.email}`);
      } catch (error) {
        console.error(`❌ Lỗi khi gửi email cho ${student.email}:`, error);
        return res.status(500).json({ error: `Lỗi khi gửi email cho ${student.email}` });
      }
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

const updateAssignedStudents = async (req, res) => {
  try {
    const { classId, addStudents, removeStudents, adminId } = req.body;

    if (!classId || (!addStudents && !removeStudents)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class không tồn tại!" });
    }

    if (addStudents && addStudents.length > 0) {
      const validStudents = await Student.find({
        _id: { $in: addStudents },
        role: "Student",
      }).select("_id");

      const validStudentIds = validStudents.map((s) => s._id.toString());
      const invalidStudentIds = addStudents.filter(
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

      if (newStudents.length > 0) {
        const assignments = newStudents.map((studentId) => ({
          student: studentId,
          class: classId,
          assignedBy: adminId,
        }));
        await AssignStudent.insertMany(assignments);
      }
    }

    if (removeStudents && removeStudents.length > 0) {
      await AssignStudent.deleteMany({
        class: classId,
        student: { $in: removeStudents },
      });
    }

    res.status(200).json({
      message: "Class student list updated successfully!",
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
  updateAssignedStudents,
};
