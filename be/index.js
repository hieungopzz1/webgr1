const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // Import connectDB từ config/db
const adminRoutes = require("./routes/admin"); // Import routes admin
const tutorRoutes = require("./routes/tutor"); // Import routes tutor
const studentRoutes = require("./routes/student"); // Import routes student
const assignmentRoutes = require("./routes/assignment"); // Import routes student

// Load biến môi trường
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Sử dụng các routes cho admin, tutor và student
app.use('/api/admin', adminRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/assignment', assignmentRoutes);

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
