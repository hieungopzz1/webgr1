import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BlogCard from '../components/BlogCard/BlogCard';
import './Home.css';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get('/api/blog');
        const transformedBlogs = response.data.blogs.map(blog => ({
          ...blog,
          authorName: blog.student_id ? 'Student' : 'Tutor',
          authorAvatar: '/default-avatar.png',
          image: null
        }));
        setBlogs(transformedBlogs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to fetch blogs');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <div className="home__loading">Loading...</div>;
  if (error) return <div className="home__error">{error}</div>;

  return (
    <div className="home">
      <div className="home__content">
        {blogs.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>
    </div>
  );
};

export default Home;
