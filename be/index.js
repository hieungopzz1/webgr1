// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
//  const connectDB = require("./config/db");
// const emailRoutes = require("./routes/emailRoutes");
// const {app, server} = require("./config/socket")
// dotenv.config();

 
//  // Kết nối MongoDB
//  connectDB();
 
//  // Middleware
//  app.use(express.json());
//  app.use(cors());
//  app.use('/uploads', express.static('uploads'));
 


// // Import Routes
//  const authRoutes = require("./routes/auth");
//  const adminRoutes = require("./routes/admin");
// const blogRoutes = require("./routes/blog");
// const meetingRoutes = require("./routes/meeting");
// const messageRoutes = require("./routes/message");
// const documentRoutes = require("./routes/documentRoutes");
// const notificationRoutes = require("./routes/notification");
// const attendanceRoutes = require("./routes/attendance");
// const scheduleRoutes = require("./routes/schedule");
// const assignStudentRoutes = require("./routes/assignStudent");
// const assignTutorRoutes = require("./routes/assignTutor");
// const classRoutes = require("./routes/class");
// const likeRoutes = require("./routes/like");

// // Sử dụng Routes
// app.use('/api/admin', adminRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/blog', blogRoutes);
// app.use('/api/meeting', meetingRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/notification', notificationRoutes);
// app.use('/api/attendance', attendanceRoutes);
//  app.use('/api/schedule', scheduleRoutes);
//  app.use('/api/assign-student', assignStudentRoutes);
//  app.use('/api/assign-tutor', assignTutorRoutes);
//  app.use('/api/class', classRoutes);
//  app.use('/api/like', likeRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // Start Server
// const PORT = process.env.PORT || 5001;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port http://localhost:${PORT}`);
// });

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

// Import các routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
// const tutorRoutes = require("./routes/tutor");
// const studentRoutes = require("./routes/student");
const blogRoutes = require("./routes/blog");
const meetingRoutes = require("./routes/meeting");
const messageRoutes = require("./routes/message");
const documentRoutes = require("./routes/documentRoutes");
const notificationRoutes = require("./routes/notification");
const attendanceRoutes = require("./routes/attendance");
const scheduleRoutes = require("./routes/schedule");
const assignStudentRoutes = require("./routes/assignStudent");
const classRoutes = require("./routes/class");
const likeRoutes = require("./routes/like");

dotenv.config();

// Khởi tạo Express app
const app = express();
const server = http.createServer(app);

// Cấu hình WebSocket với Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Lưu Socket.io vào app để sử dụng trong controller
app.set("socketio", io);

// 🔥 Quản lý user online
const onlineUsers = new Map();
app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("register", (userId) => {
    console.log(`📝 Register user: ${userId} with socket ID: ${socket.id}`);
    onlineUsers.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    const userId = [...onlineUsers.entries()].find(([key, value]) => value === socket.id)?.[0];
    if (userId) {
      onlineUsers.delete(userId);
      console.log(`❌ User ${userId} disconnected.`);
    }
  });
});


// Kết nối MongoDB
connectDB();

// Route mặc định
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Khai báo các routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/meeting', meetingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/assign-student', assignStudentRoutes);
app.use('/api/class', classRoutes);
app.use('/api/like', likeRoutes);
// app.use('/api/tutor', tutorRoutes);
// app.use('/api/student', studentRoutes);
app.use('/api/dashboard', require("./routes/dashboard")); // Route dashboard

// Chạy server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
