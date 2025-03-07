const express = require("express");
const { enrollStudentInClass } = require("../controllers/studentController");
const router = express.Router();

router.post("/class/:classId/enroll", enrollStudentInClass);

module.exports = router;
