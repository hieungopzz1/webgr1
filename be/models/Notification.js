const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Tiêu đề thông báo
    message: { type: String, required: true }, // Nội dung thông báo
    recipients: [{ type: mongoose.Schema.Types.ObjectId, refPath: "recipientType" }],
    recipientType: { type: String, enum: ["Tutor", "Student"], required: true },
    type: { type: String, enum: ["assignment", "meeting", "system"], default: "system" }, // Loại thông báo
    status: { type: String, enum: ["unread", "read"], default: "unread" }, // Trạng thái
  },
  { timestamps: true } // Tự động tạo createdAt & updatedAt
);

module.exports = mongoose.model("Notification", NotificationSchema);
