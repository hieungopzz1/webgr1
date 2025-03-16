import React, { useState, useEffect, useRef } from 'react';
import './BlogCard.css';
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { FaRegComment } from 'react-icons/fa';
import { MdEdit, MdDelete } from 'react-icons/md';
import api from '../../utils/api';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import CreateBlogModal from '../CreateBlogModal/CreateBlogModal';

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

  const shouldShowMore = blog.content.length > MAX_CONTENT_LENGTH;
  const displayContent = isExpanded 
    ? blog.content 
    : blog.content.slice(0, blog.content.lastIndexOf(' ', MAX_CONTENT_LENGTH));

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    setCurrentUser(userData);

    // Thêm event listener để đóng dropdown khi click ra ngoài
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAuthor = () => {
    if (!currentUser) return false;
    
    const authorId = blog.student_id?._id || blog.tutor_id?._id;
    return currentUser.id === authorId;
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
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handleEditSuccess = (updatedBlog) => {
    if (onEdit) onEdit(updatedBlog);
    setShowEditModal(false);
  };

  return (
    <>
      <div className="blog-card">
        <div className="blog-card__header">
          <div className="blog-card__user-info">
            <img 
              src={blog.authorAvatar || "/default-avatar.png"} 
              alt="user avatar" 
              className="blog-card__avatar"
            />
            <span className="blog-card__username">{blog.authorName}</span>
          </div>
          
          <div className="blog-card__options" ref={dropdownRef}>
            <BiDotsHorizontalRounded 
              className="blog-card__more-options" 
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && isAuthor() && (
              <div className="blog-card__dropdown">
                <button className="blog-card__dropdown-item" onClick={handleEdit}>
                  <MdEdit /> Edit
                </button>
                <button className="blog-card__dropdown-item" onClick={handleDelete}>
                  <MdDelete /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {blog.image && (
          <div className="blog-card__image-container">
            <img 
              src={blog.image} 
              alt={blog.title || 'Blog image'} 
              className="blog-card__image"
            />
          </div>
        )}

        <div className="blog-card__content">
          {blog.title && (
            <h3 className="blog-card__title">{blog.title}</h3>
          )}
          <div className="blog-card__description">
            <p>
              {displayContent}
              {shouldShowMore && (
                <button 
                  className="blog-card__show-more"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? ' show less' : ' ...show more'}
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
            <button 
              className="blog-card__action-btn" 
              onClick={() => setLiked(!liked)}
            >
              {liked ? <AiFillHeart className="icon-filled" /> : <AiOutlineHeart />}
            </button>
            <button 
              className="blog-card__action-btn"
              onClick={() => setShowComments(!showComments)}
            >
              <FaRegComment />
            </button>
          </div>
        </div>
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