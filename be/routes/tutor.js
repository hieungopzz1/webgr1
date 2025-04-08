const express = require("express");
const tutorController = require("../controllers/tutorController");
const router = express.Router();
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// Quản lý thông tin tutor

// Xem dashboard tutor
router.get("/dashboard", authenticateUser, authorizeRole(["Admin", "Tutor"]), tutorController.getTutorDashboard);

// API mới - Lấy tất cả các lớp mà tutor được phân công
router.get("/classes/:tutorId", authenticateUser, authorizeRole(["Admin", "Tutor"]), tutorController.getTutorClasses);

// API mới - Lấy danh sách sinh viên trong một lớp của tutor
router.get("/class/:classId/students", authenticateUser, authorizeRole(["Admin", "Tutor"]), tutorController.getStudentsInTutorClass);

module.exports = router;
