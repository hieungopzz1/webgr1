const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // Import connectDB từ config/db
const multer = require('multer');


//dung cac routes
const authRoutes = require("./routes/auth"); 
const adminRoutes = require("./routes/admin"); 
const blogRoutes = require("./routes/blog");
const meetingRoutes = require("./routes/meeting");
const messageRoutes = require("./routes/message");
const documentRoutes = require("./routes/documentRoutes");
const notificationRoutes = require("./routes/notification");
const attendanceRoutes = require("./routes/attendance");
const sheduleRoutes = require("./routes/schedule");
const assignStudentRoutes = require("./routes/assignStudent");
const assignTutorRoutes = require("./routes/assignTutor");
const classRoutes = require("./routes/class");
const likeRoutes = require("./routes/like");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Sử dụng các routes cho admin, tutor và student
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/meeting', meetingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/attendance',attendanceRoutes)
app.use('/api/schedule',sheduleRoutes)
app.use('/api/assign',assignStudentRoutes)
app.use('/api/assign',assignTutorRoutes)
app.use('/api/class',classRoutes)
app.use('/api/like',likeRoutes)


// Kết nối MongoDB
connectDB();  // Kết nối đến MongoDB

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Lắng nghe server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
