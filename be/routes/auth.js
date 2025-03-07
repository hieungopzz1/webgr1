const express = require('express');
const {  login } = require('../controllers/authController');
const { register } = require('../controllers/adminController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
