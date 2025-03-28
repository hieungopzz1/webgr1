const express = require("express");
const router = express.Router();
const { toggleLike, getLikesByBlog, getLikeCount } = require("../controllers/likeController");

router.post("/", toggleLike);
router.get("/:blogId/:userId", getLikesByBlog);
router.get("/:blogId/like-count", getLikeCount);

module.exports = router;
