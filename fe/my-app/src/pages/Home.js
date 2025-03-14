import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BlogCard from '../components/BlogCard/BlogCard';
import CreateBlogModal from '../components/CreateBlogModal/CreateBlogModal';
import './Home.css';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

    const handleOpenModal = () => setIsCreateModalOpen(true);
    window.addEventListener('openCreateBlogModal', handleOpenModal);

    return () => {
      window.removeEventListener('openCreateBlogModal', handleOpenModal);
    };
  }, []);

  const handleCreateSuccess = (newBlog) => {
    setBlogs(prevBlogs => [newBlog, ...prevBlogs]);
  };

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
              onClick={() => setIsCreateModalOpen(true)}
              className="create-blog-button"
            >
              Create Your First Blog
            </button>
          </div>
        )}
      </div>

      <CreateBlogModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Home;
