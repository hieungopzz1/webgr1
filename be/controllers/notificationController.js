const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const Tutor = require("../models/Tutor");
const Student = require("../models/Student");
//Tạo thông báo mới
exports.createNotification = async (req, res) => {
  try {
    const { title, message, recipients, recipientType, type } = req.body;

    if (!title || !message || !recipients || !recipientType) {
      return res.status(400).json({ error: "Missing required fields!" });
    }

    if (!["Tutor", "Student"].includes(recipientType)) {
      return res.status(400).json({ error: "Invalid recipientType!" });
    }

    if (!Array.isArray(recipients) || recipients.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: "Invalid recipients format!" });
    }

    let validRecipients;
    if (recipientType === "Tutor") {
      validRecipients = await Tutor.find({ _id: { $in: recipients } }).select("_id");
    } else {
      validRecipients = await Student.find({ _id: { $in: recipients } }).select("_id");
    }
    
    const validRecipientIds = validRecipients.map(doc => doc._id.toString());

    const invalidRecipients = recipients.filter(id => !validRecipientIds.includes(id));
    if (invalidRecipients.length > 0) {
      return res.status(400).json({ error: "Some recipients do not match the recipientType!", invalidRecipients });
    }

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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId!" });
    }

    const notifications = await Notification.find({ recipients: userId, isDeleted: false })
      .sort({ createdAt: -1 });

    if (!notifications.length) {
      return res.status(404).json({ message: "No notifications found!" });
    }

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: "Invalid notificationId!" });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: "read" },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found!" });
    }

    res.status(200).json({ message: "Notification marked as read.", notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId!" });
    }

    await Notification.updateMany({ recipients: userId, status: "unread" }, { status: "read" });

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: "Invalid notificationId!" });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found!" });
    }

    res.status(200).json({ message: "Notification deleted successfully (soft delete)!", notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restoreNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: "Invalid notificationId!" });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isDeleted: false },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found or already active!" });
    }

    res.status(200).json({ message: "Notification restored successfully!", notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
