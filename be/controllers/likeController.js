const Like = require("../models/Like");
const Blog = require("../models/Blog");

const toggleLike = async (req, res) => {
  try {
    const { blogId, userId, userRole } = req.body;

    if (!blogId || !userId || !userRole) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Bài viết không tồn tại!" });
    }

    const existingLike = await Like.findOne({ blogId, userId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      return res.status(200).json({ message: "Bỏ thích bài viết thành công!" });
    }

    const newLike = new Like({ blogId, userId, userRole });
    await newLike.save();

    res.status(200).json({ message: "Thích bài viết thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLikesByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const likes = await Like.find({ blogId }).populate(
      "userId",
      "firstName lastName"
    );

    res.status(200).json({ message: "Lấy danh sách like thành công!", likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLikeCount = async (req, res) => {
  try {
    const { blogId } = req.params;

    const likeCount = await Like.countDocuments({ blogId });

    res
      .status(200)
      .json({ message: "Lấy số lượt thích thành công!", likeCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getLikeCount, getLikesByBlog, toggleLike };
