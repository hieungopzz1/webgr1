const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");

//quan ly blog
const addBlog = async (req, res) => {
  try {
    const { title, content, tutor_id, student_id } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title are required" });
    }

    if (!tutor_id && !student_id) {
      return res.status(400).json({ message: "Tutor or student is required" });
    }

    let image = null;
    if (req.file) {
      image = `/uploads/blogs/${req.file.filename}`;
    }

    const newBlog = new Blog({
      title,
      content,
      image,
      tutor_id: tutor_id || null,
      student_id: student_id || null,
    });

    await newBlog.save();

    res.status(201).json({ message: "Successfully", blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('student_id', 'firstName lastName avatar')
      .populate('tutor_id', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    const blogsWithAuthor = blogs.map(blog => {
      const author = blog.student_id || blog.tutor_id;
      return {
        ...blog.toObject(),
        authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown User',
        authorAvatar: author?.avatar || '/default-avatar.png',
        authorType: blog.student_id ? 'student' : blog.tutor_id ? 'tutor' : 'unknown'
      };
    });

    res.status(200).json({ message: "Successfully", blogs: blogsWithAuthor });
  } catch (error) {
    console.error('Error in getAllBlogs:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const blog = await Blog.findById(blog_id)
      .populate('student_id', 'firstName lastName avatar')
      .populate('tutor_id', 'firstName lastName avatar');

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const author = blog.student_id || blog.tutor_id;
    const blogWithAuthor = {
      ...blog.toObject(),
      authorName: `${author.firstName} ${author.lastName}`,
      authorAvatar: author.avatar || '/default-avatar.png',
      authorType: blog.student_id ? 'student' : 'tutor'
    };

    res.status(200).json({ message: "Successfully", blog: blogWithAuthor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title are required" });
    }
    const blog = await Blog.findByIdAndUpdate(
      blog_id,
      { title, content, updated_at: Date.now() },
      { new: true }
    );
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json({ message: "Successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(blog_id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not exist" });
    }
    res.status(200).json({ message: "Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//quan ly comment
const addComment = async (req, res, io) => {
  try {
    const { blog_id, parent_comment_id, tutor_id, student_id, content } =
      req.body;
      if (!content) {
        return res.status(400).json({ message: "Content are required" });
      }
    const blog = await Blog.findById(blog_id);
    if (!blog) return res.status(404).json({ message: "Blog not exist" });

    if ((!tutor_id && !student_id)) {
      return res.status(400).json({
        message:
          "Tutor or student is required",
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

    // io.emit("new_comment", newComment);

    res.status(201).json({ message: "Successfully", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getComment = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    res.status(200).json({ message: "Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { content } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      comment_id,
      { content },
      { new: true }
    );
    res.status(200).json({ message: "Successfully", updatedComment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addBlog,
  addComment,
  deleteBlog,
  deleteComment,
  getAllBlogs,
  getBlogById,
  getComment,
  updateBlog,
  updateComment,
};
