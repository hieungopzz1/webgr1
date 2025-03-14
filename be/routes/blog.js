const express = require("express");
const { addBlog, addComment, deleteBlog, deleteComment, getAllBlogs, getBlogById,
    getComment, updateBlog, updateComment } = require("../controllers/blogController");
const upload = require('../config/multer');

const router = express.Router();

//route cho blog
router.get("/get-all-blogs", getAllBlogs);
router.get("/get-blog-by-id/:blog_id", getBlogById);
router.post("/create-blog", upload.single('image'), addBlog);
router.put("/update-blog/:blog_id", updateBlog);
router.delete("/delete-blog/:blog_id", deleteBlog);

//route cho comment
router.get("/get-all-comments", getComment);
router.post("/create-comment", addComment);
router.delete("/delete-comment/:comment_id", deleteComment);
router.put("/update-comment/:comment_id", updateComment);

module.exports = router;
