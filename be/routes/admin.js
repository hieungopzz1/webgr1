// backend/routes/adminRoutes.js
const express = require("express");
const { register, assign, assigns, getAssign, deleteAssign} = require("../controllers/adminController");

const router = express.Router();

router.post("/create-account", register);

router.post("/assign", assign);

router.post("/assigns", assigns);

router.get("/getassign", getAssign);

router.delete("/assign/:id", deleteAssign);

module.exports = router;
