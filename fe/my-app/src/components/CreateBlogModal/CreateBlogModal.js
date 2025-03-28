import React, { useState, useCallback, useEffect } from 'react';
import api from '../../utils/api';
import useAuth from '../../hooks/useAuth';
import InputField from '../inputField/InputField';
import './CreateBlogModal.css';

const MAX_TITLE_LENGTH = 100;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const CreateBlogModal = ({ isOpen, onClose, onSuccess, editBlog = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    imagePreview: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({
    title: '',
    content: '',
    image: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (!user) {
        setError('User session invalid. Please login again.');
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000);
      } else {
        if (editBlog) {
          setFormData({
            title: editBlog.title || '',
            content: editBlog.content || '',
            image: null,
            imagePreview: editBlog.image || null
          });
        } else {
          setFormData({
            title: '',
            content: '',
            image: null,
            imagePreview: null
          });
        }
        setError('');
        setValidation({
          title: '',
          content: '',
          image: ''
        });
      }
    }
  }, [isOpen, user, editBlog]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const validateImage = (file) => {
    if (file && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Please upload a valid image (JPEG, PNG, or GIF)';
    }
    if (file && file.size > MAX_IMAGE_SIZE) {
      return 'Image size should be less than 5MB';
    }
    return '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageError = validateImage(file);
      if (imageError) {
        setValidation(prev => ({ ...prev, image: imageError }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
        setValidation(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newValidation = {
      title: '',
      content: '',
      image: ''
    };

    if (formData.title.length > MAX_TITLE_LENGTH) {
      newValidation.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    if (!formData.content.trim()) {
      newValidation.content = 'Content is required';
    }

    if (formData.image && !ACCEPTED_IMAGE_TYPES.includes(formData.image.type)) {
      newValidation.image = 'Please upload a valid image (JPEG, PNG, or GIF)';
    } else if (formData.image && formData.image.size > MAX_IMAGE_SIZE) {
      newValidation.image = 'Image size should be less than 5MB';
    }

    setValidation(newValidation);
    return !Object.values(newValidation).some(error => error);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');

  //   if (!validateForm()) {
  //     return;
  //   }

  //   if (!user || !user.id || !user.role) {
  //     setError('User session invalid. Please login again.');
  //     setTimeout(() => {
  //       window.location.replace('/login');
  //     }, 2000);
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       throw new Error('No authentication token found');
  //     }

  //     // Tạo form data
  //     const formDataToSend = new FormData();
  //     formDataToSend.append('title', formData.title.trim());
  //     formDataToSend.append('content', formData.content.trim());
      
  //     if (formData.image) {
  //       formDataToSend.append('image', formData.image);
  //     }
  //     console.log("formDataToSend"+formDataToSend)
  //     // Xác định đúng role và ID field
  //     const idField = user.role.toLowerCase() === 'student' ? 'student_id' : 'tutor_id';
  //     formDataToSend.append(idField, user.id);

  //     // Log request details
  //     console.log('Sending request:', {
  //       url: '/api/blog/create-blog',
  //       userData: {
  //         id: user.id,
  //         role: user.role
  //       },
  //       formData: {
  //         title: formData.title.trim(),
  //         content: formData.content.trim(),
  //         [idField]: user.id,
  //         hasImage: !!formData.image
  //       }
  //     });

  //     const response = await api.post('/api/blog/create-blog', formDataToSend, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });

  //     if (response.data) {
  //       onSuccess(response.data.blog);
  //       handleClose();
  //     }
  //   } catch (err) {
  //     console.error('Error creating blog:', {
  //       error: err,
  //       status: err.response?.status,
  //       data: err.response?.data,
  //       user: user ? { id: user.id, role: user.role } : 'No user data',
  //       hasToken: !!localStorage.getItem('token')
  //     });

  //     if (!user || err.message === 'No authentication token found') {
  //       setError('User session invalid. Please login again.');
  //       setTimeout(() => {
  //         window.location.replace('/login');
  //       }, 2000);
  //     } else if (err.response?.status === 401) {
  //       setError('Your session has expired. Please login again.');
  //       setTimeout(() => {
  //         window.location.replace('/login');
  //       }, 2000);
  //     } else {
  //       setError(err.response?.data?.message || 'Failed to create blog. Please try again.');
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!validateForm()) {
      return;
    }
  
    if (!user || !user.id || !user.role) {
      setError('User session invalid. Please login again.');
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
  
      // Tạo form data
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
  
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
  
      // Xác định đúng role và ID field
      const idField = user.role.toLowerCase() === 'student' ? 'student_id' : 'tutor_id';
      formDataToSend.append(idField, user.id);
  
      // Log request details
      console.log('Sending request:', {
        url: '/api/blog/create-blog',
        userData: {
          id: user.id,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        },
        formData: {
          title: formData.title.trim(),
          content: formData.content.trim(),
          [idField]: user.id,
          hasImage: !!formData.image
        }
      });
  
      const response = await api.post('/api/blog/create-blog', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (response.data) {
        const createdBlog = response.data.blog;
  
        // Gọi onSuccess với dữ liệu blog bao gồm cả ảnh nếu có
        onSuccess({
          ...createdBlog,
          imageUrl: createdBlog.image || null
        });
  
        handleClose();
      }
    } catch (err) {
      console.error('Error creating blog:', {
        error: err,
        status: err.response?.status,
        data: err.response?.data,
        user: user ? { id: user.id, role: user.role } : 'No user data',
        hasToken: !!localStorage.getItem('token')
      });
  
      if (!user || err.message === 'No authentication token found') {
        setError('User session invalid. Please login again.');
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000);
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to create blog. Please try again.');
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
          <button 
            className="modal-close" 
            onClick={handleClose}
            aria-label="Close modal"
          >
            <i className="bi bi-x-lg"></i>
          </button>
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

          <div className="form-group">
            <div className={`image-upload ${validation.image ? 'error' : ''}`}>
              <label htmlFor="image-input" className="image-upload-label">
                <i className="bi bi-image"></i>
                <span>Add Photo (Optional, Max 5MB)</span>
                <span className="supported-formats">Supports: JPEG, PNG, GIF</span>
              </label>
              <input
                id="image-input"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={handleImageChange}
                style={{ display: 'none' }}
                aria-label="Upload image"
              />
              {validation.image && (
                <span className="validation-error">{validation.image}</span>
              )}
              {formData.imagePreview && (
                <div className="image-preview">
                  <img src={formData.imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
                    aria-label="Remove image"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

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