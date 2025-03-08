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

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({ message: "Blogs retrieved successfully", blogs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addComment = async (req, res, io) => {
    try {
      const { blog_id, parent_comment_id, tutor_id, student_id, content } = req.body;
  
      const blog = await Blog.findById(blog_id);
      if (!blog) return res.status(404).json({ message: "Blog không tồn tại" });
  
      if ((!tutor_id && !student_id) || (tutor_id && student_id)) {
        return res.status(400).json({ message: "Chỉ một trong hai (tutor_id hoặc student_id) được phép có giá trị" });
      }
  
      const newComment = new Comment({
        blog_id,
        parent_comment_id: parent_comment_id || null,
        tutor_id: tutor_id || null,
        student_id: student_id || null,
        content,
      });
  
      await newComment.save(); 
  
      // io.emit("new_comment", newComment); 
  
      res.status(201).json({ message: "Bình luận đã được thêm!", comment: newComment });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
  
const getComment = async (req, res) => {
  try {
    const { blog_id } = req.params;

    const comments = await Comment.find({ blog_id });
    res.status(200).json({ message: "Comments retrieved successfully", comments });
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
  getBlogs,
  getComment,
};
