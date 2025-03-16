import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BlogCard from '../components/BlogCard/BlogCard';
import './Home.css';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
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
  };

  useEffect(() => {
    fetchBlogs();

    const handleBlogCreated = (event) => {
      const newBlog = event.detail;
      setBlogs(prevBlogs => [newBlog, ...prevBlogs]);
    };

    window.addEventListener('blogCreated', handleBlogCreated);

    return () => {
      window.removeEventListener('blogCreated', handleBlogCreated);
    };
  }, []);

  if (loading) {
    return (
      <div className="home__loading">
        <div className="spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="home__content">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))
        ) : (
          <div className="home__no-blogs">
            <p>No blogs found</p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openCreateBlogModal'))}
              className="create-blog-button"
            >
              Create Your First Blog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
