const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // Import connectDB từ config/db
const adminRoutes = require("./routes/admin"); 

// Load biến môi trường
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Sử dụng routes của admin
app.use('/api/admin', adminRoutes);

// Kết nối MongoDB
connectDB();  // Không cần định nghĩa lại function connectDB ở đây

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Lắng nghe server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
