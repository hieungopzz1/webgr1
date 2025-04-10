// backend/routes/adminRoutes.js
const express = require("express");
const studentController = require("../controllers/studentController");
const router = express.Router();
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// quanr ly user

router.get("/joined",authenticateUser,authorizeRole(["Admin","Student"]), studentController.getJoinedClasses);




module.exports = router;
