const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const adminRoutes = require('./routes/admin'); // Import routes admin

// Load biến môi trường
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Sử dụng routes của admin
app.use('/api/admin', adminRoutes);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Kết nối MongoDB
connectDB();


// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Lắng nghe server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
