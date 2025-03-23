const express = require("express");
const router = express.Router();
const sheduleController = require("../controllers/sheduleController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");



//quan ly lich hoc
router.post("/create-schedule",authenticateUser,authorizeRole(["Admin"]), sheduleController.createSchedule);
router.put("/edit-schedule/:scheduleId",authenticateUser,authorizeRole(["Admin"]), sheduleController.updateSchedule);
router.delete("/delete-schedule/:scheduleId",authenticateUser,authorizeRole(["Admin"]), sheduleController.deleteSchedule);
router.get("/get-all-schedule",authenticateUser,authorizeRole(["Admin"]), sheduleController.getAllSchedules);
router.get("/get-by-class/:classId", authenticateUser,authorizeRole(["Admin"]),sheduleController.getScheduleByClass);


module.exports = router;
