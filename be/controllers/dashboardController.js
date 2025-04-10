const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const Schedule = require("../models/Schedule");
const Attendance = require("../models/Attendance");
const AssignStudent = require("../models/AssignStudent");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Message = require("../models/Message");
const Document = require("../models/Document");

const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTutors = await Tutor.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalSchedules = await Schedule.countDocuments();

    const attendanceRecords = await Attendance.find();
    const presentCount = attendanceRecords.filter(
      (a) => a.status === "Present"
    ).length;
    const absentCount = attendanceRecords.filter(
      (a) => a.status === "Absent"
    ).length;

    //lay ra cac student co lop
    const assignedStudentIds = await AssignStudent.distinct("student");

    const unassignedStudents = await Student.find({
      _id: { $nin: assignedStudentIds },
      role: "Student",
    });

    const totalUnassignedStudents = unassignedStudents.length;
    const totalAssignedStudents = assignedStudentIds.length;

    const allClasses = await Class.find().select("_id class_name");

    const assignedClassIds = await AssignStudent.distinct("class");

    const assignedClassIdsStr = assignedClassIds.map((id) => id.toString());
    const unassignedClasses = allClasses.filter(
      (cls) => !assignedClassIdsStr.includes(cls._id.toString())
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    //tat ca tin nhan cua moi nguoi trong 7 ngay
    const messages = await Message.find({
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 });

    //student tuong tac trong 7 ngay
    const activeStudents7Days = await Message.distinct("senderId", {
      createdAt: { $gte: sevenDaysAgo },
      senderId: { $in: await Student.distinct("_id") },
    });
    //student k tuong tac trong 7 ngay
    const studentsNoInteraction7Days = await Student.find({
      _id: { $nin: activeStudents7Days },
    });

    //student không dang documents
    const studentsWithDocuments = await Document.distinct("student_id");
    const studentsWithoutDocuments = await Student.find({
      _id: { $nin: studentsWithDocuments },
    }).select("firstName lastName email student_ID");

    const tutors = await Tutor.find();
    const messageStats = await Promise.all(
      tutors.map(async (tutor) => {
        const messageCount = await Message.countDocuments({
          $or: [{ senderId: tutor._id }, { receiver_id: tutor._id }],
        });
        return {
          tutorId: tutor._id,
          tutorName: `${tutor.firstName} ${tutor.lastName}`,
          messageCount,
        };
      })
    );
    const totalMessages = messageStats.reduce(
      (sum, stat) => sum + stat.messageCount,
      0
    );
    const averageMessagesPerTutor =
      tutors.length > 0 ? totalMessages / tutors.length : 0;

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
      messages: messages.length,
      activeStudents7Days: activeStudents7Days.length,
      studentsNoInteraction7Days: studentsNoInteraction7Days.length,
      studentsWithoutDocuments: studentsWithoutDocuments.length,
      averageMessagesPerTutor,
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTutorDashboard = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const blogs = await Blog.find({ tutor_id: tutorId });
    const documents = await Document.find({ tutor_id: tutorId });
    const comments = await Comment.find({ tutor_id: tutorId });
    const likes = await Like.find({
      blog_id: { $in: blogs.map((blog) => blog._id) },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMessages = await Message.find({
      $or: [{ senderId: tutorId }, { receiverId: tutorId }],
      timestamp: { $gte: sevenDaysAgo },
    }).sort({ timestamp: -1 }).lean();

    const classes = await Class.find({ tutor: tutorId });

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      totalBlogs: blogs.length,
      totalComments: comments.length,
      totalLikes: likes.length,
      recentMessages,
      totalDocuments: documents.length,
      totalClasses: classes.length,
    });
  } catch (error) {
    console.error("Error in getTutorDashboard:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const blogs = await Blog.find({ student_id: studentId });
    const totalBlogs = blogs.length;

    const comments = await Comment.find({ student_id: studentId });
    const likes = await Like.find({
      blog_id: { $in: blogs.map((blog) => blog._id) },
    });

    const attendanceRecords = await Schedule.find({
      student_id: studentId,
      status: "absent",
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMessages = await Message.find({
      $or: [{ senderId: studentId }, { receiverId: studentId }],
      timestamp: { $gte: sevenDaysAgo },
    }).sort({ timestamp: -1 }).lean();

    const assignments = await AssignStudent.find({ student: studentId,  });

    const classes = assignments
      .filter((a) => a.class !== null)
      .map((a) => a.class);

    res.json({
      role: "student",
      totalBlogs,
      totalComments: comments.length,
      totalLikes: likes.length,
      totalAbsentDays: attendanceRecords.length,
      classes: classes.length,
      recentMessages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAdminDashboard, getTutorDashboard, getStudentDashboard };
