const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "userRole",
  },
  userRole: {
    type: String,
    required: true,
    enum: ["Student", "Tutor"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Like", LikeSchema);
