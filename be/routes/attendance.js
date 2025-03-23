const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");


router.get("/:scheduleId/students",authenticateUser,authorizeRole(["Admin"]),attendanceController.getStudentsBySchedule);

router.post("/mark", authenticateUser, authorizeRole(["Tutor", "Admin"]), attendanceController.markAttendance);

router.get("/:scheduleId/status",authenticateUser,authorizeRole(["Admin"]), attendanceController.getAttendanceStatus );

module.exports = router;
