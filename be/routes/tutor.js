const express = require("express");
const tutorController = require("../controllers/tutorController");
const router = express.Router();
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// Quản lý thông tin tutor

// API mới - Lấy tất cả các lớp mà tutor được phân công
router.get("/joined/", authenticateUser, authorizeRole(["Admin", "Tutor"]), tutorController.getTutorClasses);


module.exports = router;
