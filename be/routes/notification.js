// const express = require("express");
// const {
//     createNotification,
//     getNotifications,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification,
//     restoreNotification
//   } = require("../controllers/notificationController");

// const router = express.Router();

// // Tạo thông báo mới
// router.post("/", createNotification);

// // Lấy danh sách thông báo theo userId
// router.get("/:userId", getNotifications);

// // Đánh dấu thông báo đã đọc
// router.patch("/:notificationId/mark-as-read", markAsRead);

// router.delete("/:notificationId", deleteNotification);

// router.patch("/mark-all-as-read/:userId", markAllAsRead);

// router.patch("/:notificationId/restore", restoreNotification);
// module.exports = router;


const express = require('express');
const { sendNotification, getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/notifications/send',authenticateUser,authorizeRole(["Admin"]), sendNotification); // Chỉ admin gọi được
router.get('/notifications',authenticateUser,authorizeRole(["Admin", "Student", "Tutor"]), getNotifications);
router.post('/mark-read/:notificationId', authenticateUser, authorizeRole(["Admin", "Student", "Tutor"]), markAsRead);
router.post('/mark-all-read', authenticateUser, authorizeRole(["Admin", "Student", "Tutor"]), markAllAsRead); 

module.exports = router;