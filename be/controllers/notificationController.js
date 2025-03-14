const Notification = require("../models/Notification");

//Tạo thông báo mới
exports.createNotification = async (req, res) => {
  try {
    const { title, message, recipients, recipientType, type } = req.body;
    
    const notification = new Notification({ title, message, recipients, recipientType, type });
    await notification.save();

    res.status(201).json({ message: "Notification created successfully!", notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Lấy danh sách thông báo theo userId
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notifications = await Notification.find({ recipients: userId }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndUpdate(notificationId, { status: "read" });

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
