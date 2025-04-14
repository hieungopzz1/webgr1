const express = require("express");
const { addBlog, addComment, deleteBlog, deleteComment, getAllBlogs, getBlogById , 
    getComment, updateBlog, updateComment, getCommentsByBlogId, getBlogsByUserId } = require("../controllers/blogController");
const router = express.Router();
//routes for blog
router.get("/get-all-blogs", getAllBlogs);
router.get("/get-blog-by-id/:blog_id", getBlogById);
router.post("/create-blog", addBlog);
router.put("/update-blog/:blog_id", updateBlog);
router.delete("/delete-blog/:blog_id", deleteBlog);

//routes for comment
router.get("/get-all-comments", getComment);
router.get("/:blogId/comments", getCommentsByBlogId);
router.post("/create-comment", addComment);
router.delete("/delete-comment/:comment_id", deleteComment);
router.put("/update-comment/:comment_id", updateComment);

// Add new route to get blogs by user ID and role
router.get("/get-user-blogs/:userRole/:userId", getBlogsByUserId);

module.exports = router;
