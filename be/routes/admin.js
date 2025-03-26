// backend/routes/adminRoutes.js
const express = require("express");
const adminController = require("../controllers/adminController");
const upload = require("../config/multer")
const router = express.Router();
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// quanr ly user
router.post("/create-account",authenticateUser,authorizeRole(["Admin"]),upload.single("avatar"), adminController.createAccount);

router.delete("/delete-user/:id", authenticateUser,authorizeRole(["Admin"]),adminController.deleteUser);

router.get("/get-users",authenticateUser,authorizeRole(["Admin"]), adminController.getAllUsers);

router.get("/get-user/:id",authenticateUser,authorizeRole(["Admin"]), adminController.getUserById);

router.get("/dashboard",authenticateUser,authorizeRole(["Admin"]), adminController.getAdminDashboard);




module.exports = router;
