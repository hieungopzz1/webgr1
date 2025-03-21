const express = require('express');
const { getMessages, getUsersForSidebar, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

router.use(protect);

router.get("/users", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send", sendMessage);

module.exports = router;