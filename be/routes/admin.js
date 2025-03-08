// backend/routes/adminRoutes.js
const express = require("express");
const { getAllUsers, createAccount, addClass, getAllClasses, assignTutorToClass, deleteUser} = require("../controllers/adminController");
const upload = require("../config/multer")
const router = express.Router();

router.post("/create-accont", upload.single("avatar"), createAccount);

router.post("/class/create-class", addClass);

router.get("class/getAllClasses", getAllClasses)

router.post("/class/:classId/assign-tutor", assignTutorToClass);

router.delete("/users/:role/:id", deleteUser);

router.get("/get-users", getAllUsers);

module.exports = router;
