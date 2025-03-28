const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

//quarn ly lop
router.post("/create-class",authenticateUser,authorizeRole(["Admin"]), classController.createClass);
router.get("/get-all-class", classController.getAllClasses);
router.get("/get-class/:classId", classController.getClassById);
router.get("/:classId/users", classController.getUsersInClass );
router.put("/update-class/:classId", classController.updateClass);
router.delete("/delete-class/:classId", classController.deleteClass);
router.get("/unassigned-classes", classController.getClassesWithoutStudents);

module.exports = router;
