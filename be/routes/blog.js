const express = require("express");
const { addBlog, addComment, deleteBlog, deleteComment } = require("../controllers/blogController");
const router = express.Router();

router.post("/create-blog", addBlog);
router.post("/create-comment", addComment);
router.delete("/delete-blog/:blog_id", deleteBlog);
router.delete("/delete-comment/:comment_id", deleteComment);

module.exports = router;
