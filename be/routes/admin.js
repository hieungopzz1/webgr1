// backend/routes/adminRoutes.js
const express = require("express");
const { createAccount, login } = require("../controllers/adminController");

const router = express.Router();

router.post("/create-account", createAccount);
router.post("/login", login);

module.exports = router;
