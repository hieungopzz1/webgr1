const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/sheduleController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");



//quan ly lich hoc
router.post("/create-schedule",authenticateUser,authorizeRole(["Admin"]), scheduleController.createSchedule);
router.put("/edit-schedule/:scheduleId",authenticateUser,authorizeRole(["Admin"]), scheduleController.updateSchedule);
router.delete("/delete-schedule/:scheduleId",authenticateUser,authorizeRole(["Admin"]), scheduleController.deleteSchedule);
router.get("/get-all-schedule",authenticateUser,authorizeRole(["Admin"]), scheduleController.getAllSchedules);
router.get("/get-by-class/:classId", authenticateUser,authorizeRole(["Admin"]),scheduleController.getScheduleByClass);


module.exports = router;
