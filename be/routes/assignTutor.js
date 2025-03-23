const express = require("express");
const router = express.Router();
const assignTutorController = require("../controllers/assignTutorController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

//quan ly phan bo sinh vien va tutor
router.get("/get-all-tutors",authenticateUser,authorizeRole(["Admin"]), assignTutorController.getAllTutors);
router.post("/assign-tutor",authenticateUser,authorizeRole(["Admin"]), assignTutorController.assignTutor);
router.get("/get-tutors/:classId", authenticateUser,authorizeRole(["Admin"]),assignTutorController.getAssignTutorInClass);
router.delete("/remove",authenticateUser,authorizeRole(["Admin"]),assignTutorController.removeTutor );
module.exports = router;