// const Notification = require("../models/Notification");
// const mongoose = require("mongoose");
// const Tutor = require("../models/Tutor");
// const Student = require("../models/Student");
// const sendEmailAllocation = require("../services/emailService");

// // Hàm kiểm tra email hợp lệ
// function isValidEmail(email) {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// }

// // Tạo thông báo mới và gửi email
// exports.createNotification = async (req, res) => {
//   try {
//     const { title, message, recipients, recipientType, type } = req.body;

//     // Kiểm tra trường bắt buộc
//     if (!title || !message || !recipients || !recipientType) {
//       return res.status(400).json({ error: "Missing required fields!" });
//     }

//     // Kiểm tra recipientType hợp lệ
//     if (!["Tutor", "Student"].includes(recipientType)) {
//       return res.status(400).json({ error: "Invalid recipientType!" });
//     }

//     // Kiểm tra recipients có đúng định dạng không
//     if (!Array.isArray(recipients) || recipients.some(id => !mongoose.Types.ObjectId.isValid(id))) {
//       return res.status(400).json({ error: "Invalid recipients format!" });
//     }

//     // Kiểm tra recipients có rỗng không
//     if (recipients.length === 0) {
//       return res.status(400).json({ error: "Recipients list cannot be empty!" });
//     }

//     // Truy vấn danh sách người nhận hợp lệ
//     let validRecipients;
//     if (recipientType === "Tutor") {
//       validRecipients = await Tutor.find({ _id: { $in: recipients } }).select("_id email");
//     } else {
//       validRecipients = await Student.find({ _id: { $in: recipients } }).select("_id email");
//     }

//     // Lấy danh sách ID hợp lệ và email
//     const validRecipientIds = validRecipients.map(doc => doc._id.toString());
//     let emails = validRecipients.map(doc => doc.email);

//     // Kiểm tra người nhận hợp lệ
//     if (!validRecipients.length) {
//       return res.status(404).json({ error: "No valid recipients found!" });
//     }

//     // Lọc email hợp lệ
//     emails = emails.filter(isValidEmail);
//     if (emails.length === 0) {
//       return res.status(400).json({ error: "No valid emails found for recipients!" });
//     }

//     // Kiểm tra nếu có recipients không hợp lệ
//     const invalidRecipients = recipients.filter(id => !validRecipientIds.includes(id));
//     if (invalidRecipients.length > 0) {
//       return res.status(400).json({
//         error: "Some recipients do not match the recipientType!",
//         invalidRecipients
//       });
//     }

//     // Lưu thông báo vào database
//     const notification = new Notification({ title, message, recipients, recipientType, type });
//     await notification.save();

//     // Gửi email đến từng người nhận
//     let emailSentCount = 0;
//     let failedEmails = [];

//     for (const email of emails) {
//       try {
//         await sendEmailAllocation(email, title, message);
//         emailSentCount++;
//       } catch (error) {
//         console.error(`❌ Lỗi khi gửi email cho ${email}:`, error);
//         failedEmails.push(email);
//       }
//     }

//     // Nếu không có email nào gửi thành công, xóa thông báo đã lưu
//     if (emailSentCount === 0) {
//       await Notification.findByIdAndDelete(notification._id);
//       return res.status(500).json({ error: "Failed to send emails to all recipients!" });
//     }

//     res.status(201).json({
//       message: "Notification created and emails sent successfully!",
//       notification,
//       failedEmails: failedEmails.length ? failedEmails : undefined
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Lấy danh sách thông báo theo userId
// exports.getNotifications = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: "Invalid userId!" });
//     }

//     const notifications = await Notification.find({ recipients: userId, isDeleted: false })
//       .sort({ createdAt: -1 });

//     if (!notifications.length) {
//       return res.status(404).json({ message: "No notifications found!" });
//     }

//     res.status(200).json(notifications);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Đánh dấu thông báo đã đọc
// exports.markAsRead = async (req, res) => {
//   try {
//     const { notificationId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(notificationId)) {
//       return res.status(400).json({ error: "Invalid notificationId!" });
//     }

//     const notification = await Notification.findByIdAndUpdate(
//       notificationId,
//       { status: "read" },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({ error: "Notification not found!" });
//     }

//     res.status(200).json({ message: "Notification marked as read.", notification });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Đánh dấu tất cả thông báo đã đọc
// exports.markAllAsRead = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: "Invalid userId!" });
//     }

//     await Notification.updateMany({ recipients: userId, status: "unread" }, { status: "read" });

//     res.status(200).json({ message: "All notifications marked as read." });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Xóa thông báo (soft delete)
// exports.deleteNotification = async (req, res) => {
//   try {
//     const { notificationId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(notificationId)) {
//       return res.status(400).json({ error: "Invalid notificationId!" });
//     }

//     const notification = await Notification.findByIdAndUpdate(
//       notificationId,
//       { isDeleted: true },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({ error: "Notification not found!" });
//     }

//     res.status(200).json({ message: "Notification deleted successfully!", notification });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Khôi phục thông báo đã xóa
// exports.restoreNotification = async (req, res) => {
//   try {
//     const { notificationId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(notificationId)) {
//       return res.status(400).json({ error: "Invalid notificationId!" });
//     }

//     const notification = await Notification.findByIdAndUpdate(
//       notificationId,
//       { isDeleted: false },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({ error: "Notification not found!" });
//     }

//     res.status(200).json({ message: "Notification restored successfully!", notification });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');

const sendNotification = async (req, res) => {
  try {
    const { title, content, recipientIds } = req.body; // Danh sách ID của student/tutor
    const senderId = req.user.id; // Admin ID

    if (!title || !content || !recipientIds || !Array.isArray(recipientIds)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Tạo thông báo mới
    const notification = new Notification({
      title,
      content,
      senderId,
      recipientIds,
    });
    await notification.save();

    // // Gửi thông báo qua Socket.IO nếu người nhận online
    // const io = req.app.get('io');
    // const onlineUsers = req.app.get('onlineUsers');
    // recipientIds.forEach((recipientId) => {
    //   const socketId = onlineUsers.get(recipientId)?.socketId;
    //   if (socketId) {
    //     io.to(socketId).emit('newNotification', {
    //       id: notification._id,
    //       title,
    //       content,
    //       senderId,
    //       timestamp: notification.timestamp,
    //     });
    //   }
    // });

    res.status(201).json({ message: 'Notification sent successfully', notification });
  } catch (error) {
    console.error('Error in sendNotification:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ recipientIds: userId })
      .sort({ timestamp: -1 })
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (!notification.readBy) {
      notification.readBy = [userId];
    } else if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
    }
    
    await notification.save();
    
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error in markAsRead:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all notifications for this user
    const notifications = await Notification.find({ recipientIds: userId });
    
    // Update each notification to add userId to readBy
    const updatePromises = notifications.map(notification => {
      if (!notification.readBy) {
        notification.readBy = [userId];
      } else if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
      }
      return notification.save();
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { sendNotification, getNotifications, markAsRead, markAllAsRead };