
const express = require('express');
const { getMessages, getUsersForSidebar, sendMessage } = require('../controllers/messageController');

const router = express.Router();

router.get("/users",  getUsersForSidebar);
router.get("/:id", getMessages);

router.post("/send/:id", sendMessage);

export default router;