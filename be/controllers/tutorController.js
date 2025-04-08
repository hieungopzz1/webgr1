const Schedule = require("../models/Schedule");
const Class = require("../models/Class");
const AssignStudent = require("../models/AssignStudent");
const Student = require("../models/Student");

// Lấy thông tin dashboard của tutor
const getTutorDashboard = async (req, res) => {
  try {
    // Logic lấy dữ liệu dashboard
    const dashboardData = {
      // Dữ liệu dashboard
    };
  
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy tất cả các lớp học mà tutor được phân công
const getTutorClasses = async (req, res) => {
  try {
    const { tutorId } = req.params;

    // Kiểm tra quyền - chỉ admin hoặc chính tutor đó mới được xem thông tin
    if (req.user.role === 'Tutor' && req.user.id !== tutorId) {
      return res.status(403).json({ message: "Không có quyền xem thông tin lớp học của tutor khác" });
    }

    // Tìm tất cả các lớp mà tutor được phân công
    const classes = await Class.find({ tutor: tutorId })
      .select('_id class_name subject major');

    if (classes.length === 0) {
      return res.status(200).json({ 
        message: "Tutor chưa được phân công lớp nào", 
        classes: [] 
      });
    }

    // Đếm số học sinh trong mỗi lớp
    const classesWithStudentCount = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await AssignStudent.countDocuments({ class: cls._id });
        return {
          ...cls.toObject(),
          studentCount
        };
      })
    );

    res.status(200).json({
      message: "Lấy danh sách lớp học thành công",
      total: classes.length,
      classes: classesWithStudentCount
    });
  } catch (error) {
    console.error("Error in getTutorClasses:", error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách sinh viên trong một lớp của tutor
const getStudentsInTutorClass = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Kiểm tra lớp học có tồn tại không
    const classInfo = await Class.findById(classId);
    if (!classInfo) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    // Kiểm tra quyền - chỉ admin hoặc tutor được phân công mới được xem
    if (req.user.role === 'Tutor' && classInfo.tutor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền xem thông tin sinh viên của lớp này" });
    }

    // Lấy danh sách sinh viên trong lớp
    const assignedStudents = await AssignStudent.find({ class: classId })
      .populate({
        path: 'student',
        select: '_id student_ID firstName lastName email avatar major'
      });

    if (assignedStudents.length === 0) {
      return res.status(200).json({
        message: "Lớp học chưa có sinh viên nào",
        class: classInfo,
        students: []
      });
    }

    // Lấy thông tin sinh viên
    const students = assignedStudents.map(entry => entry.student);

    res.status(200).json({
      message: "Lấy danh sách sinh viên thành công",
      class: classInfo,
      totalStudents: students.length,
      students
    });
  } catch (error) {
    console.error("Error in getStudentsInTutorClass:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTutorDashboard,
  getTutorClasses,
  getStudentsInTutorClass
};