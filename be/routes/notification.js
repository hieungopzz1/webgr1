const express = require("express");
const { createNotification, getNotifications, markAsRead } = require("../controllers/notificationController");

const router = express.Router();

// Tạo thông báo mới
router.post("/", createNotification);

// Lấy danh sách thông báo theo userId
router.get("/:userId", getNotifications);

// Đánh dấu thông báo đã đọc
router.patch("/:notificationId/mark-as-read", markAsRead);

module.exports = router;
