const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, 
    message: { type: String, required: true }, 
    recipients: [{ type: mongoose.Schema.Types.ObjectId, refPath: "recipientType" }],
    recipientType: { type: String, enum: ["Tutor", "Student"], required: true },
    type: { type: String, enum: ["assignment", "meeting", "system"], default: "system" }, 
    status: { type: String, enum: ["unread", "read"], default: "unread" }, 
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Notification", NotificationSchema);
