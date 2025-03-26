const express = require('express');
const { getMessages, getUsersForSidebar, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware'); 
const multer = require('multer'); // Import multer

const router = express.Router();

router.use(protect);

router.get("/users", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send", multer().none(), sendMessage); // Apply multer middleware here

module.exports = router;