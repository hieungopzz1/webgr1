const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http"); // Import HTTP module
 const { Server } = require("socket.io"); // Import Socket.io
 const connectDB = require("./config/db");
const emailRoutes = require("./routes/emailRoutes");

dotenv.config();
 
 const app = express();
 const server = http.createServer(app); // Tạo HTTP server từ Express
 const io = new Server(server, {
   cors: {
     origin: "*",
     methods: ["GET", "POST"],
   },
 });
 
 // Kết nối MongoDB
 connectDB();
 
 // Middleware
 app.use(express.json());
 app.use(cors());
 app.use('/uploads', express.static('uploads'));
 
 // Lưu Socket.io vào app để sử dụng trong controller
 app.set("socketio", io);
 
 // Khi có kết nối từ client
 io.on("connection", (socket) => {
   console.log("🔥 New client connected:", socket.id);
 
   socket.on("disconnect", () => {
     console.log("❌ Client disconnected:", socket.id);
   });
 });

// Import Routes
 const authRoutes = require("./routes/auth");
 const adminRoutes = require("./routes/admin");
const blogRoutes = require("./routes/blog");
const meetingRoutes = require("./routes/meeting");
const messageRoutes = require("./routes/message");
const documentRoutes = require("./routes/documentRoutes");
const notificationRoutes = require("./routes/notification");
const attendanceRoutes = require("./routes/attendance");
const scheduleRoutes = require("./routes/schedule");
const assignStudentRoutes = require("./routes/assignStudent");
const assignTutorRoutes = require("./routes/assignTutor");
const classRoutes = require("./routes/class");
const likeRoutes = require("./routes/like");

// Sử dụng Routes
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
 app.use('/api/assign-tutor', assignTutorRoutes);
 app.use('/api/class', classRoutes);
 app.use('/api/like', likeRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
