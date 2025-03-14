const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // Import connectDB từ config/db
const multer = require('multer');
const uploadDocumentsRoute = require("./routes/uploadDocumentsRoute"); 



// const tutorRoutes = require("./routes/tutor"); // Import routes tutor
// const studentRoutes = require("./routes/student"); // Import routes student
// const assignmentRoutes = require("./routes/assignment"); // Import routes student
// const tutorRoutes = require("./routes/tutor");
// const enrollmentRoutes = require("./routes/enrollment"); // Import routes enrollment
// const studentRoutes = require("./routes/student");
// Load biến môi trường
const authRoutes = require("./routes/auth"); 
const adminRoutes = require("./routes/admin"); 
const blogRoutes = require("./routes/blog");
const meetingRoutes = require("./routes/meeting");
// const messageRoutes = require("./routes/mesage.route");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));



// Sử dụng các routes cho admin, tutor và student
// app.use('/api/tutor', tutorRoutes);
// app.use('/api/student', studentRoutes);
// app.use('/api/assignment', assignmentRoutes);
// app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/meeting', meetingRoutes);
// app.use('/api/messages', messageRoutes);

// Sử dụng route upload tài liệu
app.use('/api', uploadDocumentsRoute);

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
