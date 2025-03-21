const express = require("express");
const {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    restoreNotification
  } = require("../controllers/notificationController");

const router = express.Router();

// Tạo thông báo mới
router.post("/", createNotification);

// Lấy danh sách thông báo theo userId
router.get("/:userId", getNotifications);

// Đánh dấu thông báo đã đọc
router.patch("/:notificationId/mark-as-read", markAsRead);

router.delete("/:notificationId", deleteNotification);

router.patch("/mark-all-as-read/:userId", markAllAsRead);

router.patch("/:notificationId/restore", restoreNotification);
module.exports = router;
