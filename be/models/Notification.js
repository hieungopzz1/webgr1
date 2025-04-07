// const mongoose = require("mongoose");

// const NotificationSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true }, 
//     message: { type: String, required: true }, 
//     recipients: [{ type: mongoose.Schema.Types.ObjectId, refPath: "recipientType" }],
//     recipientType: { type: String, enum: ["Tutor", "Student"], required: true },
//     type: { type: String, enum: ["assignment", "meeting", "system"], default: "system" }, 
//     status: { type: String, enum: ["unread", "read"], default: "unread" }, 
//     isDeleted: { type: Boolean, default: false }
//   },
//   { timestamps: true } 
// );

// module.exports = mongoose.model("Notification", NotificationSchema);
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  senderId: { type: String, required: true }, // Admin ID
  recipientIds: [{ type: String }], // Danh sách ID của student/tutor nhận thông báo
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: String }], // Danh sách ID của người đã đọc
});

module.exports = mongoose.model('Notification', notificationSchema);