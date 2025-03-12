import React, { useState } from 'react';
import './BlogCard.css';
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { FaRegComment } from 'react-icons/fa';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';

const BlogCard = ({ blog }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);

  return (
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
        <BiDotsHorizontalRounded className="blog-card__more-options" />
      </div>

      <div className="blog-card__image-container">
        <img 
          src={blog.image} 
          alt={blog.title} 
          className="blog-card__image"
        />
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
        <button 
          className="blog-card__action-btn"
          onClick={() => setSaved(!saved)}
        >
          {saved ? <BsBookmarkFill /> : <BsBookmark />}
        </button>
      </div>

      <div className="blog-card__content">
        <p className="blog-card__title">
          <strong>{blog.authorName}</strong> {blog.title}
        </p>
        <p className="blog-card__description">{blog.content}</p>
        <span className="blog-card__timestamp">
          {new Date(blog.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default BlogCard; 