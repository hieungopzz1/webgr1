const express = require("express");
const { getAdminDashboard, getTutorDashboard, getStudentDashboard } = require("../controllers/dashboardController");
const { authenticateUser,authorizeRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin",authenticateUser,authorizeRole(["Admin"]), getAdminDashboard);
router.get("/tutor",authenticateUser,authorizeRole(["Admin","Tutor"]) , getTutorDashboard);
router.get("/student",authenticateUser,authorizeRole(["Admin","Student"]) , getStudentDashboard);

module.exports = router;
