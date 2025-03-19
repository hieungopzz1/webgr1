// backend/routes/adminRoutes.js
const express = require("express");
const { getAllUsers, getUserById, createAccount, 
    deleteUser , 
    createMeeting,updateMeeting, deleteMeeting,
    assignTutor,
    createClass, updateClass, deleteClass,
    getClassById, getAllClasses,
    assignStudent, getAssignTutorInClass, getAssignStudentInClass,
    createSchedule, updateSchedule, deleteSchedule,
    getScheduleByClass, getAllSchedules,
    getStudentsByMajor
} = require("../controllers/adminController");
const upload = require("../config/multer")
const router = express.Router();

// quanr ly user
router.post("/create-account", upload.single("avatar"), createAccount);

router.delete("/delete-user/:id", deleteUser);

router.get("/get-users", getAllUsers);

router.get("/get-user/:id", getUserById);

//loc major
router.get("/get-students-by-major", getStudentsByMajor);

//quarn ly lop
router.post("/class/create-class", createClass);
router.get("/class/get-all-class", getAllClasses);
router.get("/class/get-class/:classId", getClassById);

//quan ly phan bo sinh vien va tutor
router.post("/assign/assign-tutor", assignTutor);
router.post("/assign/assign-student", assignStudent);
router.get("/assign/get-tutors/:classId", getAssignTutorInClass);
router.get("/assign/get-students/:classId", getAssignStudentInClass);

//quan ly lich hoc
router.post("/schedule/create-schedule", createSchedule);
router.get("/schedule/get-all-schedule", getAllSchedules);
router.get("/schedule/get-by-class/:classId", getScheduleByClass);




//quan ly meeting
router.post("/meeting/create-meeting", createMeeting);

router.put("/meeting/update/:meetingId", updateMeeting );

router.delete("/meeting/delete/:meetingId", deleteMeeting );

module.exports = router;
