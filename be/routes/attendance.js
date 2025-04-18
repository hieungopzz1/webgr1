const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");


router.get("/:scheduleId/students",authenticateUser,authorizeRole(["Admin","Tutor"]),attendanceController.getStudentsBySchedule);

router.post("/mark", authenticateUser, authorizeRole(["Tutor", "Admin"]), attendanceController.markAttendance);

router.get("/:scheduleId/status",authenticateUser,authorizeRole(["Admin","Tutor","Student"]), attendanceController.getAttendanceStatus );

router.get("/student-status",authenticateUser,authorizeRole(["Admin","Student"]), attendanceController.getStudentAttendance );



module.exports = router;
