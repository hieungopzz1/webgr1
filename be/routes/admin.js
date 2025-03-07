// backend/routes/adminRoutes.js
const express = require("express");
const { register } = require("../controllers/adminController");
const router = express.Router();
router.post("/create-account", register);
module.exports = router;
