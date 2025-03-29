const Like = require("../models/Like");
const Blog = require("../models/Blog");

const toggleLike = async (req, res) => {
  try {
    const { blogId, userId, userRole } = req.body;

    if (!blogId || !userId || !userRole) {
      return res.status(400).json({ message: "All field is require!" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not exist!" });
    }

    const existingLike = await Like.findOne({ blogId, userId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      return res.status(200).json({ message: "Cancel this blog success!" });
    }

    const newLike = new Like({ blogId, userId, userRole });
    await newLike.save();

    res.status(200).json({ message: "Like blog success!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLikesByBlog = async (req, res) => {
  try {
    const { blogId, userId } = req.params;
    const like = await Like.findOne({ blogId, userId });

    const likeCount = await Like.countDocuments({ blogId });

    res.json({ liked: !!like, likeCount });
  } catch (error) {
    console.error("Error checking like:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getLikeCount = async (req, res) => {
  try {
    const { blogId } = req.params;

    const likeCount = await Like.countDocuments({ blogId });

    res
      .status(200)
      .json({ message: "Successfully!", likeCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getLikeCount, getLikesByBlog, toggleLike };
