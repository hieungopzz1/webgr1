import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import api from '../utils/api';
import BlogCard from '../components/BlogCard/BlogCard';
import { getUserData } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import './Home.css';

// Tách thành component con riêng biệt để có thể tối ưu hiệu suất
const UserProfileCard = memo(({ user, onFilterByUser, isCurrentUserFilter }) => {
  if (!user) return null;
  
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    // If the path is already a full URL, use it as is
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // If the path is a relative path, add the base URL
    return `${process.env.REACT_APP_API_URL}${avatarPath}`;
  };
  
  return (
    <div 
      className={`user-profile-card ${isCurrentUserFilter ? 'active' : ''}`}
      onClick={() => onFilterByUser(user)}
    >
      <div className="user-profile-avatar">
        {user.avatar ? (
          <img 
            src={getAvatarUrl(user.avatar)} 
            alt={`${user.firstName}'s avatar`} 
            onError={(e) => {
              // If image loading fails, display default avatar
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
        {isCurrentUserFilter ? (
          <span className="viewing-profile-badge">Viewing</span>
        ) : (
          <span className="view-profile-hint">Click to view blogs</span>
        )}
      </div>
    </div>
  );
});

// Extract loading component for reuse
const LoadingSpinner = () => (
  <div className="home__loading">
    <div className="spinner"></div>
    <p>Loading blogs...</p>
  </div>
);

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filterUser, setFilterUser] = useState(null);
  const initialFetchDone = useRef(false);
  const eventListenerRegistered = useRef(false);
  const toast = useToast();

  // Use useCallback to optimize performance
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/blog/get-all-blogs');
      
      if (response.data && Array.isArray(response.data.blogs)) {
        setBlogs(response.data.blogs);
        setFilteredBlogs(response.data.blogs);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      toast.error('Failed to load blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle filtering blogs by user
  const handleFilterByUser = useCallback(async (selectedUser) => {
    if (filterUser && filterUser.id === selectedUser.id) {
      // If clicking on the same user, remove filter
      setFilterUser(null);
      
      // Get all blogs again
      try {
        setLoading(true);
        const response = await api.get('/api/blog/get-all-blogs');
        
        if (response.data && Array.isArray(response.data.blogs)) {
          setBlogs(response.data.blogs);
          setFilteredBlogs(response.data.blogs);
        }
        toast.info('Showing all blogs');
      } catch (err) {
        console.error('Error fetching all blogs:', err);
        toast.error('Unable to fetch all blogs. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Set the selected user for filtering
      setFilterUser(selectedUser);
      
      try {
        setLoading(true);
        // Call API to get this user's blogs
        const response = await api.get(`/api/blog/get-user-blogs/${selectedUser.role}/${selectedUser.id}`);
        
        if (response.data && Array.isArray(response.data.blogs)) {
          setFilteredBlogs(response.data.blogs);
          
          if (response.data.blogs.length === 0) {
            toast.info(`${selectedUser.firstName} has no blogs yet`);
          } else {
            toast.info(`Showing ${response.data.blogs.length} blogs by ${selectedUser.firstName}`);
          }
        }
      } catch (err) {
        console.error('Error fetching user blogs:', err);
        toast.error(`Unable to fetch ${selectedUser.firstName}'s blogs. Please try again.`);
        // Reset filter if there's an error
        setFilterUser(null);
      } finally {
        setLoading(false);
      }
    }
  }, [filterUser, toast]);

  // Use useCallback for event handlers
  const handleCreateBlogClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openCreateBlogModal'));
  }, []);

  // Use useCallback for event handlers
  const handleBlogCreated = useCallback(async (event) => {
    const newBlog = event.detail;
    toast.success('Blog posted successfully!');
    
    // If viewing all blogs or viewing blogs of the creator,
    // we need to refresh the data
    if (!filterUser || 
        (filterUser.role.toLowerCase() === 'student' && newBlog.student_id === filterUser.id) ||
        (filterUser.role.toLowerCase() === 'tutor' && newBlog.tutor_id === filterUser.id)) {
      
      try {
        // If filtering by a user
        if (filterUser) {
          const response = await api.get(`/api/blog/get-user-blogs/${filterUser.role}/${filterUser.id}`);
          if (response.data && Array.isArray(response.data.blogs)) {
            setFilteredBlogs(response.data.blogs);
          }
        } 
        // If viewing all blogs
        else {
          const response = await api.get('/api/blog/get-all-blogs');
          if (response.data && Array.isArray(response.data.blogs)) {
            setBlogs(response.data.blogs);
            setFilteredBlogs(response.data.blogs);
          }
        }
      } catch (err) {
        console.error('Error refreshing blogs after creation:', err);
      }
    }
  }, [filterUser, toast]);

  // Handle blog update
  const handleBlogUpdate = useCallback(async (updatedBlog) => {
    toast.success('Blog updated successfully!');
    
    try {
      // If filtering by a user
      if (filterUser) {
        const response = await api.get(`/api/blog/get-user-blogs/${filterUser.role}/${filterUser.id}`);
        if (response.data && Array.isArray(response.data.blogs)) {
          setFilteredBlogs(response.data.blogs);
        }
      } 
      // If viewing all blogs
      else {
        const response = await api.get('/api/blog/get-all-blogs');
        if (response.data && Array.isArray(response.data.blogs)) {
          setBlogs(response.data.blogs);
          setFilteredBlogs(response.data.blogs);
        }
      }
    } catch (err) {
      console.error('Error refreshing blogs after update:', err);
    }
  }, [filterUser, toast]);

  // Handle blog deletion
  const handleBlogDelete = useCallback(async (blogId) => {
    toast.success('Blog deleted successfully!');
    
    try {
      // If filtering by a user
      if (filterUser) {
        const response = await api.get(`/api/blog/get-user-blogs/${filterUser.role}/${filterUser.id}`);
        if (response.data && Array.isArray(response.data.blogs)) {
          setFilteredBlogs(response.data.blogs);
        }
      } 
      // If viewing all blogs
      else {
        const response = await api.get('/api/blog/get-all-blogs');
        if (response.data && Array.isArray(response.data.blogs)) {
          setBlogs(response.data.blogs);
          setFilteredBlogs(response.data.blogs);
        }
      }
    } catch (err) {
      console.error('Error refreshing blogs after deletion:', err);
    }
  }, [filterUser, toast]);

  // Register events for initial load and when refresh is needed
  const registerEvents = useCallback(() => {
    // Remove old event listener if already registered
    window.removeEventListener('blogCreated', handleBlogCreated);
    
    // Register new event listener
    window.addEventListener('blogCreated', handleBlogCreated);
    eventListenerRegistered.current = true;
    
    // Register event for data refresh
    const handleRefreshBlogs = () => {
      fetchBlogs();
      toast.info('Refreshing blog content...');
    };
    
    window.addEventListener('refreshBlogs', handleRefreshBlogs);
    
    return () => {
      window.removeEventListener('blogCreated', handleBlogCreated);
      window.removeEventListener('refreshBlogs', handleRefreshBlogs);
      eventListenerRegistered.current = false;
    };
  }, [fetchBlogs, handleBlogCreated, toast]);

  // useEffect for fetching data and user data - only runs once
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchBlogs();
      
      // Get user information from localStorage - only once
      const userData = getUserData();
      setUser(userData);
      
      initialFetchDone.current = true;
    }
  }, [fetchBlogs]); // Add fetchBlogs as dependency

  // Separate useEffect for event listener
  useEffect(() => {
    const cleanup = registerEvents();
    return cleanup;
  }, [registerEvents]); // Use registerEvents as dependency

  // Trigger refresh blogs event when component re-renders
  useEffect(() => {
    // This function will be called when component has rendered
    const triggerRefreshOnMount = () => {
      // Check if component has fully mounted and not initial load
      if (initialFetchDone.current) {
        // Avoid fetching too many times when component re-renders
        const timer = setTimeout(() => {
          fetchBlogs();
        }, 500); // Add a small delay to avoid too many fetches
        
        return () => clearTimeout(timer);
      }
    };
    
    // Call refresh function
    triggerRefreshOnMount();
  }, []); // Empty dependency array to only run once after mount

  if (loading && blogs.length === 0) {
    return <LoadingSpinner />;
  }

  // Determine if currently viewing current user's blogs
  const viewingCurrentUserBlogs = filterUser && user && filterUser.id === user.id;
  const userHasNoBlogs = viewingCurrentUserBlogs && filteredBlogs.length === 0;

  return (
    <div className="home">
      <div className="home__layout">
        {/* Left column - BlogCards */}
        <div className="home__main-content">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <BlogCard 
                key={blog._id} 
                blog={blog} 
                onDelete={handleBlogDelete}
                onEdit={handleBlogUpdate}
              />
            ))
          ) : (
            <div className="home__no-blogs">
              {userHasNoBlogs ? (
                <>
                  <p>You don't have any blogs yet</p>
                  <button 
                    onClick={handleCreateBlogClick}
                    className="create-blog-button"
                  >
                    Create Your First Blog
                  </button>
                </>
              ) : (
                filterUser ? (
                  <p>{filterUser.firstName} has no blogs yet</p>
                ) : (
                  <>
                    <p>No blogs found</p>
                    <button 
                      onClick={handleCreateBlogClick}
                      className="create-blog-button"
                    >
                      Create First Blog
                    </button>
                  </>
                )
              )}
            </div>
          )}
        </div>
        
        {/* Right column - User profile information */}
        <div className="home__sidebar">
          <UserProfileCard 
            user={user} 
            onFilterByUser={handleFilterByUser}
            isCurrentUserFilter={viewingCurrentUserBlogs}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
