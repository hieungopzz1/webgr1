const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Route tìm kiếm tổng hợp (users + blogs)
router.get('/', authenticateUser, searchController.search);

// Route tìm kiếm người dùng
router.get('/users', authenticateUser, searchController.searchUsers);

// Route tìm kiếm blogs
router.get('/blogs', authenticateUser, searchController.searchBlogs);

module.exports = router; 