import React, { useState, useCallback, useEffect } from 'react';
import api from '../../utils/api';
import useAuth from '../../hooks/useAuth';
import InputField from '../inputField/InputField';
import './CreateBlogModal.css';
import { useToast } from '../../context/ToastContext';

const MAX_TITLE_LENGTH = 100;

const CreateBlogModal = ({ isOpen, onClose, onSuccess, editBlog = null }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (!user) {
        setError('User session invalid. Please login again.');
        toast.error('User session invalid. Please login again.');
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000); 
      } else {
        if (editBlog) {
          setFormData({
            title: editBlog.title || '',
            content: editBlog.content || ''
          });
        } else {
          setFormData({
            title: '',
            content: ''
          });
        }
        setError('');
        setValidation({
          title: '',
          content: ''
        });
      }
    }
  }, [isOpen, user, editBlog, toast]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const validateForm = () => {
    const newValidation = {
      title: '',
      content: ''
    };

    if (formData.title.length > MAX_TITLE_LENGTH) {
      newValidation.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    if (!formData.content.trim()) {
      newValidation.content = 'Content is required';
    }

    setValidation(newValidation);
    return !Object.values(newValidation).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!validateForm()) {
      return;
    }
  
    if (!user || !user.id || !user.role) {
      setError('User session invalid. Please login again.');
      toast.error('User session invalid. Please login again.');
      setTimeout(() => {
        window.location.replace('/login');
      }, 2000);
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      // Determine correct role and ID field
      const idField = user.role.toLowerCase() === 'student' ? 'student_id' : 'tutor_id';
      
      // Create payload for request
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        [idField]: user.id
      };
  
      // Log request details
      console.log('Sending request:', {
        url: editBlog ? `/api/blog/update-blog/${editBlog._id}` : '/api/blog/create-blog',
        userData: {
          id: user.id,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        },
        formData: payload
      });
      
      let response;
      
      if (editBlog) {
        // Update blog
        response = await api.put(`/api/blog/update-blog/${editBlog._id}`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Blog post updated successfully');
      } else {
        // Create new blog
        response = await api.post('/api/blog/create-blog', payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Blog post created successfully');
      }
  
      if (response.data) {
        onSuccess(response.data.blog);
        handleClose();
      }
    } catch (err) {
      console.error('Error with blog:', {
        error: err,
        status: err.response?.status,
        data: err.response?.data,
        user: user ? { id: user.id, role: user.role } : 'No user data',
        hasToken: !!localStorage.getItem('token')
      });
  
      if (!user || err.message === 'No authentication token found') {
        setError('User session invalid. Please login again.');
        toast.error('User session invalid. Please login again.');
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000);
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        toast.error('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000);
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to process blog. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (!isOpen) return null;

  const charactersLeft = {
    title: MAX_TITLE_LENGTH - formData.title.length
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editBlog ? 'Edit Post' : 'Create New Post'}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="create-blog-form">
          {error && (
            <div className="error-message" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <InputField
            name="title"
            placeholder="Enter title (optional)..."
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            error={validation.title}
            maxLength={MAX_TITLE_LENGTH}
            characterCount={`${charactersLeft.title} characters left`}
            fullWidth
            size="large"
          />

          <InputField
            name="content"
            placeholder="What's on your mind?"
            value={formData.content}
            onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
            error={validation.content}
            multiline
            rows={5}
            fullWidth
            required
          />

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat spinning"></i>
                  {editBlog ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                editBlog ? 'Save Changes' : 'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogModal; 