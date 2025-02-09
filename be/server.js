const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load biến môi trường
dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});



// Lắng nghe server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
