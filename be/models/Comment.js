const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    tutor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      default: null,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    parent_comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, 
    },
  });
  
  module.exports = mongoose.model("Comment", CommentSchema);
  