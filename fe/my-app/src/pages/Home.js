import React, { useState, useEffect, useCallback, memo } from 'react';
import api from '../utils/api';
import BlogCard from '../components/BlogCard/BlogCard';
import { getUserData } from '../utils/storage';
import './Home.css';

// Tách thành component con riêng biệt để có thể tối ưu hiệu suất
const UserProfileCard = memo(({ user }) => {
  if (!user) return null;
  
  return (
    <div className="user-profile-card">
      <div className="user-profile-avatar">
        {user.avatar ? (
          <img src={user.avatar} alt={`${user.firstName}'s avatar`} />
        ) : (
          <div className="default-avatar">
            {user.firstName?.charAt(0) || 'U'}
          </div>
        )}
      </div>
      <div className="user-profile-info">
        <h3 className="user-profile-name">
          {user.firstName} {user.lastName}
        </h3>
        <p className="user-profile-role">{user.role}</p>
      </div>
    </div>
  );
});

// Tách phần loading để tái sử dụng
const LoadingSpinner = () => (
  <div className="home__loading">
    <div className="spinner"></div>
    <p>Loading blogs...</p>
  </div>
);

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Sử dụng useCallback để tối ưu hiệu suất
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/blog/get-all-blogs');
      
      if (response.data && Array.isArray(response.data.blogs)) {
        setBlogs(response.data.blogs);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sử dụng useCallback cho event handlers
  const handleCreateBlogClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openCreateBlogModal'));
  }, []);

  // Sử dụng useCallback cho event handlers
  const handleBlogCreated = useCallback((event) => {
    const newBlog = event.detail;
    setBlogs(prevBlogs => [newBlog, ...prevBlogs]);
  }, []);

  useEffect(() => {
    // Fetch data khi component mount
    fetchBlogs();
    
    // Lấy thông tin người dùng từ localStorage
    const userData = getUserData();
    setUser(userData);

    // Thêm event listener
    window.addEventListener('blogCreated', handleBlogCreated);

    // Cleanup function
    return () => {
      window.removeEventListener('blogCreated', handleBlogCreated);
    };
  }, [fetchBlogs, handleBlogCreated]); // Thêm dependencies

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="home">
      <div className="home__layout">
        {/* Cột bên trái - BlogCards */}
        <div className="home__main-content">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))
          ) : (
            <div className="home__no-blogs">
              <p>No blogs found</p>
              <button 
                onClick={handleCreateBlogClick}
                className="create-blog-button"
              >
                Create Your First Blog
              </button>
            </div>
          )}
        </div>
        
        {/* Cột bên phải - Thông tin người dùng */}
        <div className="home__sidebar">
          <UserProfileCard user={user} />
        </div>
      </div>
    </div>
  );
};

export default Home;
