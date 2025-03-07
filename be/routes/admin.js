// backend/routes/adminRoutes.js
const express = require("express");
const { register, addClass, getAllClasses, assignTutorToClass} = require("../controllers/adminController");

const router = express.Router();

router.post("/create-account", register);

router.post("/class/create-class", addClass);

router.get("class/getAllClasses", getAllClasses)

router.post("/class/:classId/assign-tutor", assignTutorToClass);


module.exports = router;
