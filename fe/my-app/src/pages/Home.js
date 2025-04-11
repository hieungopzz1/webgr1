import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import api from '../utils/api';
import BlogCard from '../components/BlogCard/BlogCard';
import { getUserData } from '../utils/storage';
import './Home.css';

// Tách thành component con riêng biệt để có thể tối ưu hiệu suất
const UserProfileCard = memo(({ user }) => {
  if (!user) return null;
  
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    // Nếu đường dẫn đã là URL đầy đủ, dùng luôn
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // Nếu đường dẫn là relative path, thêm base URL
    return `${process.env.REACT_APP_API_URL}${avatarPath}`;
  };
  
  return (
    <div className="user-profile-card">
      <div className="user-profile-avatar">
        {user.avatar ? (
          <img 
            src={getAvatarUrl(user.avatar)} 
            alt={`${user.firstName}'s avatar`} 
            onError={(e) => {
              // Nếu load ảnh bị lỗi, hiển thị avatar mặc định
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="default-avatar" style={{ display: user.avatar ? 'none' : 'flex' }}>
          {user.firstName?.charAt(0) || 'U'}
        </div>
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
  const initialFetchDone = useRef(false);
  const eventListenerRegistered = useRef(false);

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

  // useEffect cho việc fetch data và user data - chỉ chạy 1 lần
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchBlogs();
      
      // Lấy thông tin người dùng từ localStorage - chỉ lấy 1 lần
      const userData = getUserData();
      setUser(userData);
      
      initialFetchDone.current = true;
    }
  }, []); // Chỉ chạy 1 lần khi mount

  // useEffect riêng cho event listener - chỉ đăng ký một lần
  useEffect(() => {
    if (!eventListenerRegistered.current) {
      window.addEventListener('blogCreated', handleBlogCreated);
      eventListenerRegistered.current = true;
      
      return () => {
        window.removeEventListener('blogCreated', handleBlogCreated);
        eventListenerRegistered.current = false;
      };
    }
  }, []); // Chỉ đăng ký sự kiện một lần duy nhất

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
