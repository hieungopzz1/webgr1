// const Schedule = require("../models/Schedule");
// const Blog = require("../models/Blog");
// const Comment = require("../models/Comment");
// const Like = require("../models/Like");

// const getStudentDashboard = async (req, res) => {
//   try {
//     const studentId = req.user.id;

//     // Lấy danh sách blogs mà student đã đăng
//     const blogs = await Blog.find({ student_id: studentId });

//     // Tổng số blogs, comments, likes
//     const totalBlogs = blogs.length;
//     const comments = await Comment.find({ student_id: studentId });
//     const likes = await Like.find({ blog_id: { $in: blogs.map(blog => blog._id) } });

//     // Số buổi nghỉ học
//     const totalAbsentDays = await Schedule.countDocuments({ student_id: studentId, status: "absent" });

//     const dashboardData = {
//       role: "student",
//       totalBlogs,
//       totalComments: comments.length,
//       totalLikes: likes.length,
//       totalAbsentDays,
//     };

//     res.json(dashboardData);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// module.exports = { getStudentDashboard };