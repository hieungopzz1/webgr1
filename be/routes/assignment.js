const express = require("express");
const router = express.Router();
const { assign, assigns, getAssign, deleteAssign } = require("../controllers/assignController");


router.post("/", assign);

router.post("/assigns", assigns);

router.get("/", getAssign);

router.delete("/:id", deleteAssign);

module.exports = router;
