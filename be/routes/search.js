const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/blogs', authenticateUser, searchController.searchBlogs);

router.get('/', authenticateUser, searchController.searchBlogs);

module.exports = router; 