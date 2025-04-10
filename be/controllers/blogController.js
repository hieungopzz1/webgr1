const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const fs = require("fs");
const path = require("path");

//quan ly blog

const addBlog = async (req, res) => {
  try {
    const { title, content, tutor_id, student_id } = req.body;
    const image = req.file ? `/uploads/blog/${req.file.filename}` : null;

    if (!tutor_id && !student_id) {
      if (image) removeImage(image);
      return res.status(400).json({ message: "Either tutor_id or student_id is required" });
    }

    const tutor = tutor_id ? await Tutor.findById(tutor_id) : null;
    const student = student_id ? await Student.findById(student_id) : null;

    if (!tutor && !student) {
      if (image) removeImage(image);
      return res.status(404).json({ message: "Tutor or Student not found" });
    }

    const newBlog = new Blog({
      title,
      content,
      tutor_id: tutor_id || null,
      student_id: student_id || null,
      image,
    });

    await newBlog.save();

    // Realtime update for respective dashboards
    const io = req.app.get("socketio");
    const onlineUsers = req.app.get("onlineUsers");
    
    console.log("🟢 Current online users:", onlineUsers);
    
    const userId = student_id || tutor_id;
    console.log("🟡 User ID:", userId);
    
    const socketId = onlineUsers.get(userId);
    console.log("🔴 Socket ID:", socketId);
    if (socketId) {
      io.to(socketId).emit("updateDashboard", {
        message: "A new blog has been added!",
        newBlog,
      });
    }

    const populatedBlog = await Blog.findById(newBlog._id)
      .populate("tutor_id", "firstName lastName avatar")
      .populate("student_id", "firstName lastName avatar");

    res.status(201).json({ message: "Blog created successfully", blog: populatedBlog });
  } catch (error) {
    if (req.file) removeImage(`/uploads/blog/${req.file.filename}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const removeImage = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.error("Error deleting image:", err);
  });
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("student_id", "firstName lastName avatar")
      .populate("tutor_id", "firstName lastName avatar")
      .sort({ createdAt: -1 });

    const blogsWithAuthor = blogs.map((blog) => {
      const author = blog.student_id || blog.tutor_id;
      const imageUrl = blog.image ? `http://localhost:5001${blog.image}` : null;
      const avatarUrl = author?.avatar
        ? `http://localhost:5001${author.avatar}`
        : "/default-avatar.png";
      return {
        ...blog.toObject(),
        authorName: author
          ? `${author.firstName} ${author.lastName}`
          : "Unknown User",
        authorAvatar: avatarUrl,
        authorType: blog.student_id
          ? "student"
          : blog.tutor_id
          ? "tutor"
          : "unknown",
        image: imageUrl,
      };
    });

    res.status(200).json({ message: "Successfully", blogs: blogsWithAuthor });
  } catch (error) {
    console.error("Error in getAllBlogs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const blog = await Blog.findById(blog_id)
      .populate("student_id", "firstName lastName avatar")
      .populate("tutor_id", "firstName lastName avatar");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const author = blog.student_id || blog.tutor_id;
    const avatarUrl = author?.avatar
      ? `http://localhost:5001${author.avatar}`
      : "/default-avatar.png";
    const imageUrl = blog.image ? `http://localhost:5001${blog.image}` : null;

    const blogWithAuthor = {
      ...blog.toObject(),
      authorName: `${author.firstName} ${author.lastName}`,
      authorAvatar: avatarUrl,
      authorType: blog.student_id ? "student" : "tutor",
      image: imageUrl,
    };

    res.status(200).json({ message: "Successfully", blog: blogWithAuthor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const { title, content, removeImage } = req.body;

    const currentBlog = await Blog.findById(blog_id);
    if (!currentBlog) return res.status(404).json({ error: "Blog not found" });

    let image = currentBlog.image;
    if (req.file) {
      // Nếu có upload image mới
      if (currentBlog.image) {
        // Xóa image cũ nếu có
        removeImage(currentBlog.image);
      }
      image = `/uploads/blog/${req.file.filename}`;
    } else if (removeImage === "true") {
      // Nếu user muốn xóa image
      if (currentBlog.image) {
        removeImage(currentBlog.image);
      }
      image = null;
    }

    const blog = await Blog.findByIdAndUpdate(
      blog_id,
      {
        title: title || "",
        content,
        image,
        updated_at: Date.now(),
      },
      { new: true }
    )
      .populate("student_id", "firstName lastName avatar")
      .populate("tutor_id", "firstName lastName avatar");

    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // Format response giống như getBlogById
    const author = blog.student_id || blog.tutor_id;
    const avatarUrl = author?.avatar
      ? `http://localhost:5001${author.avatar}`
      : "/default-avatar.png";
    const imageUrl = blog.image ? `http://localhost:5001${blog.image}` : null;

    const blogWithAuthor = {
      ...blog.toObject(),
      authorName: `${author.firstName} ${author.lastName}`,
      authorAvatar: avatarUrl,
      authorType: blog.student_id ? "student" : "tutor",
      image: imageUrl,
    };

    res.status(200).json({ message: "Successfully", blog: blogWithAuthor });
  } catch (error) {
    if (req.file) {
      removeImage(`/uploads/blog/${req.file.filename}`);
    }
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

    await Promise.all([
      Comment.deleteMany({ blog_id }),
      Like.deleteMany({ blog_id })
    ]);

    return res.status(200).json({ 
      message: "Blog, likes, and comments deleted successfully!" 
    });
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

    if (!tutor_id && !student_id) {
      return res.status(400).json({
        message: "Tutor or student is required",
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
