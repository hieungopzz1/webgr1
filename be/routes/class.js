const express = require("express");
const { studentEnrollToClass  } = require("../controllers/studentController");

const router = express.Router();

router.post("/enroll/:classId", studentEnrollToClass);

module.exports = router;
