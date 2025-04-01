const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const Schedule = require("../models/Schedule");
const Attendance = require("../models/Attendance");
const AssignStudent = require("../models/AssignStudent");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");

// 🏆 Dashboard của Admin
const getAdminDashboard = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalTutors = await Tutor.countDocuments();
        const totalClasses = await Class.countDocuments();
        const totalSchedules = await Schedule.countDocuments();
    
        const attendanceRecords = await Attendance.find();
        const presentCount = attendanceRecords.filter(a => a.status === "Present").length;
        const absentCount = attendanceRecords.filter(a => a.status === "Absent").length;
        
        //lay ra cac student co lop
        const assignedStudentIds = await AssignStudent.distinct("student");
    
        const unassignedStudents = await Student.find({
          _id: { $nin: assignedStudentIds },
          role: "Student",
        })
    
        const totalUnassignedStudents = unassignedStudents.length;
        const totalAssignedStudents = assignedStudentIds.length;
    
        const allClasses = await Class.find().select("_id class_name");

        const assignedClassIds = await AssignStudent.distinct("class");

        const assignedClassIdsStr = assignedClassIds.map(id => id.toString());
         const unassignedClasses = allClasses.filter(cls => 
          !assignedClassIdsStr.includes(cls._id.toString()));
    
        const dashboardData = {
          totalStudents,
          totalTutors,
          totalClasses,
          presentCount,
          absentCount,
          totalUnassignedStudents, 
          totalAssignedStudents,
          totalSchedules,
          totalClassAssign: assignedClassIds.length,
          totalClassUnassign: unassignedClasses.length,
        };
    
        res.json(dashboardData);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};

// 🎓 Dashboard của Tutor
const getTutorDashboard = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const blogs = await Blog.find({ tutor_id: tutorId });
    const totalBlogs = blogs.length;

    const comments = await Comment.find({ tutor_id: tutorId });
    const likes = await Like.find({ blog_id: { $in: blogs.map(blog => blog._id) } });

    const totalStudents = await Student.countDocuments({ tutor_id: tutorId });

    res.json({
      role: "tutor",
      totalBlogs,
      totalComments: comments.length,
      totalLikes: likes.length,
      totalStudents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📚 Dashboard của Student
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const blogs = await Blog.find({ student_id: studentId });
    const totalBlogs = blogs.length;

    const comments = await Comment.find({ student_id: studentId });
    const likes = await Like.find({ blog_id: { $in: blogs.map(blog => blog._id) } });

    const attendanceRecords = await Schedule.find({ student_id: studentId, status: "absent" });

    res.json({
      role: "student",
      totalBlogs,
      totalComments: comments.length,
      totalLikes: likes.length,
      totalAbsentDays: attendanceRecords.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAdminDashboard, getTutorDashboard, getStudentDashboard };
