const Blog = require("../models/Blog");
const Comment = require("../models/Comment");

const addBlog = async (req, res) => {
  try {
    const { title, content, tutor_id, student_id } = req.body;

    if ((!tutor_id && !student_id) || (tutor_id && student_id)) {
      return res.status(400).json({
        message:
          "Cannot post",
      });
    }

    const newBlog = new Blog({
      title,
      content,
      tutor_id: tutor_id || null,
      student_id: student_id || null,
    });

    await newBlog.save();

    res
      .status(201)
      .json({ message: "Blog created successfully!", blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { blog_id, parent_comment_id, tutor_id, student_id, content } =
      req.body;

    const blog = await Blog.findById(blog_id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not exist" });
    }

    if ((!tutor_id && !student_id) || (tutor_id && student_id)) {
      return res.status(400).json({
        message:
          "Only one of (tutor_id or student_id) is allowed to have a value",
      });
    }

    const newComment = new Comment({
      blog_id,
      parent_comment_id: parent_comment_id || null,
      tutor_id: tutor_id || null,
      student_id: student_id || null,
      content,
    });

    await newComment.save();

    res.status(201).json({ message: "Comment added!", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;

    await Comment.deleteMany({ blog_id });

    const deletedBlog = await Blog.findByIdAndDelete(blog_id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not exist" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { comment_id } = req.params;

    await Comment.deleteMany({ parent_comment_id: comment_id });

    const deletedComment = await Comment.findByIdAndDelete(comment_id);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not exist" });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addBlog,
  addComment,
  deleteBlog,
  deleteComment,
};
