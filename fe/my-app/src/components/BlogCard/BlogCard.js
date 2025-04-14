import React, { useState, useEffect, useRef, useCallback } from "react";
import "./BlogCard.css";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import api from "../../utils/api";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import CreateBlogModal from "../CreateBlogModal/CreateBlogModal";
import CommentList from "../CommentList/CommentList";
import { useToast } from "../../context/ToastContext";

const MAX_CONTENT_LENGTH = 300;

const BlogCard = ({ blog, onDelete, onEdit }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef(null);
  const toast = useToast();

  const shouldShowMore = blog.content.length > MAX_CONTENT_LENGTH;
  const displayContent = isExpanded
    ? blog.content
    : blog.content.slice(0, blog.content.lastIndexOf(" ", MAX_CONTENT_LENGTH));

  // Get user information from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    setCurrentUser(userData);
  }, []);

  // Fetch like status (using useCallback to prevent re-renders)
  const fetchLikeStatus = useCallback(async () => {
    if (!currentUser || !currentUser.id) return;

    try {
      const response = await api.get(`/api/like/${blog._id}/${currentUser.id}`);
      setLiked(response.data.liked);
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  }, [blog._id, currentUser]);

  // Call API to get like status when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchLikeStatus();
    }
  }, [currentUser, fetchLikeStatus]);

  const handleLike = async () => {
    if (!currentUser || !currentUser.id) {
      toast.error("You need to log in to like posts");
      return;
    }

    try {
      const response = await api.post(`/api/like`, {
        blogId: blog._id,
        userId: currentUser.id,
        userRole: currentUser.role,
      });

      setLiked(response.data.liked);
      if (response.data.liked) {
        toast.success("Post liked!");
      } else {
        toast.info("Like removed");
      }
      fetchLikeStatus();
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    }
  };

  const handleDelete = async () => {
    setShowConfirmDelete(true);
    setShowDropdown(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/blog/delete-blog/${blog._id}`);
      if (onDelete) onDelete(blog._id);
      setShowConfirmDelete(false);
      toast.success("Blog post deleted successfully");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete the blog post");
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handleEditSuccess = (updatedBlog) => {
    if (onEdit) onEdit(updatedBlog);
    setShowEditModal(false);
    toast.success("Blog post updated successfully");
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const author = blog.student_id || blog.tutor_id;
  const authorName = author
    ? `${author.firstName} ${author.lastName}`
    : "Unknown";
  const authorAvatar = author?.avatar
    ? `http://localhost:5001${author.avatar}`
    : "/default-avatar.png";

  const isAuthor = () => {
    if (!currentUser) return false;
    const authorId = blog.student_id?._id || blog.tutor_id?._id;
    return currentUser.id === authorId;
  };

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="blog-card">
        <div className="blog-card__header">
          <div className="blog-card__user-info">
            <img
              src={authorAvatar}
              alt="user avatar"
              className="blog-card__avatar"
            />
            <span className="blog-card__username">{authorName}</span>
          </div>

          <div className="blog-card__options" ref={dropdownRef}>
            <BiDotsHorizontalRounded
              className="blog-card__more-options"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && isAuthor() && (
              <div className="blog-card__dropdown">
                <button
                  className="blog-card__dropdown-item"
                  onClick={handleEdit}
                >
                  <MdEdit /> Edit
                </button>
                <button
                  className="blog-card__dropdown-item"
                  onClick={handleDelete}
                >
                  <MdDelete /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="blog-card__content">
          {blog.title && <h3 className="blog-card__title">{blog.title}</h3>}
          <div className="blog-card__description">
            <p>
              {displayContent}
              {shouldShowMore && (
                <button
                  className="blog-card__show-more"
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{ 
                    textDecoration: 'none', 
                    backgroundColor: 'transparent',
                    color: '#1877f2',
                    transition: 'none'
                  }}
                >
                  {isExpanded ? " show less" : " ...show more"}
                </button>
              )}
            </p>
          </div>
          <span className="blog-card__timestamp">
            {new Date(blog.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="blog-card__actions">
          <div className="blog-card__action-buttons">
            <button className="blog-card__action-btn" onClick={handleLike}>
              {liked ? (
                <AiFillHeart className="icon-filled" />
              ) : (
                <AiOutlineHeart />
              )}
            </button>

            <button
              className="blog-card__action-btn"
              onClick={toggleComments}
            >
              <FaRegComment />
            </button>
          </div>
        </div>

        {showComments && <CommentList blogId={blog._id} />}
      </div>

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
      />

      <CreateBlogModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        editBlog={blog}
      />
    </>
  );
};

export default BlogCard;
