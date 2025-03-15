// backend/routes/adminRoutes.js
const express = require("express");
const { getAllUsers, getUserById, createAccount, getAllAssign, 
    deleteUser , updateAssign, deleteAssign, 
    createMeeting,updateMeeting, deleteMeeting,
    assignTutor, getAssignById } = require("../controllers/adminController");
const upload = require("../config/multer")
const router = express.Router();

// quanr ly user
router.post("/create-account", upload.single("avatar"), createAccount);

router.delete("/delete-user/:id", deleteUser);

router.get("/get-users", getAllUsers);

router.get("/get-user/:id", getUserById);

//quarn lys class
router.post("/assign/create-assign", assignTutor);

router.get("/assign/get-all-assign", getAllAssign);

router.get("/assign/get-assign/:assignId", getAssignById);

router.put("/assign/update/:assignId", updateAssign); 

router.delete("/assign/delete/:assignId", deleteAssign); 


//quarn ly phan bo sinh vien

//quan ly meeting
router.post("/meeting/create-meeting", createMeeting);

router.put("/meeting/update/:meetingId", updateMeeting );

router.delete("/meeting/delete/:meetingId", deleteMeeting );

module.exports = router;
