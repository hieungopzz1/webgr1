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

router.put("/update-user/:id", authenticateUser, authorizeRole(["Admin"]), upload.single("avatar"), adminController.updateUser);
router.get("/filter-users", authenticateUser, authorizeRole(["Admin"]), (req, res) => {
  const { role, major } = req.query;
  if (role && major) {
    adminController.filterUsersByRoleAndMajor(req, res);
  } 
  else if (role && !major) {
    adminController.filterUsersByRole(req, res);
  }
  else if (!role && major) {
    adminController.filterUsersByMajor(req, res);
  }
  else {
    adminController.getAllUsers(req, res);
  }
});

module.exports = router;
