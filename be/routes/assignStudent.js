const express = require("express");
const router = express.Router();
const assignStudentController = require("../controllers/assignStudentController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

//quan ly phan bo sinh vien 

//loc major
router.get("/get-students-by-major",authenticateUser,authorizeRole(["Admin"]), assignStudentController.getStudentsByMajor);
router.get("/get-all-students",authenticateUser,authorizeRole(["Admin"]), assignStudentController.getAllStudents);
router.post("/assign-student",authenticateUser,authorizeRole(["Admin"]), assignStudentController.assignStudent);
router.get("/get-students/:classId",authenticateUser,authorizeRole(["Admin"]), assignStudentController.getAssignStudentInClass);
router.delete("/remove",authenticateUser,authorizeRole(["Admin"]), assignStudentController.removeStudent );
router.delete("/remove-all/:classId",authenticateUser, authorizeRole(["Admin"]), assignStudentController.removeAllStudents);
router.put("/update-assign",authenticateUser,authorizeRole(["Admin"]), assignStudentController.updateAssignedStudents)


module.exports = router;