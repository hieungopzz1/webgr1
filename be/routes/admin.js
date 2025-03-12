// backend/routes/adminRoutes.js
const express = require("express");
const { getAllUsers, createAccount, 
    addClass, getAllClasses, assignTutorToClass, 
    deleteUser , updateClass, deleteClass, 
    updateAssignment, deleteAssignment, 
    createMeeting,updateMeeting, deleteMeeting } = require("../controllers/adminController");
const upload = require("../config/multer")
const router = express.Router();

// quanr ly user
router.post("/create-account", upload.single("avatar"), createAccount);

router.delete("/users/:role/:id", deleteUser);

router.get("/get-users", getAllUsers);

//quarn lys class
router.post("/class/create-class", addClass);

router.get("/class/getAllClasses", getAllClasses)

router.put("/class/update/:classId", updateClass); 

router.delete("/class/delete/:classId", deleteClass); 


//quarn ly phan bo sinh vien
router.post("/class/assign-tutor/:classId", assignTutorToClass);

router.put("/class/updateassign/:assignmentId", updateAssignment);

router.delete("/class/deleteassign/:assignmentId", deleteAssignment);

//quan ly meeting
router.post("/meeting/create-meeting", createMeeting);

router.put("/meeting/update/:meetingId", updateMeeting );

router.delete("/meeting/delete/:meetingId", deleteMeeting );

module.exports = router;
