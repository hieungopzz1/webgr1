const express = require('express');
const { login, getMe, register } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);

module.exports = router;
