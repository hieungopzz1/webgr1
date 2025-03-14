import React, { useState, useContext, useCallback } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import './CreateBlogModal.css';

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 2000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const CreateBlogModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    imagePreview: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({
    title: '',
    content: '',
    image: ''
  });

  const handleClose = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      image: null,
      imagePreview: null
    });
    setError('');
    setValidation({
      title: '',
      content: '',
      image: ''
    });
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
    } else if (formData.content.length > MAX_CONTENT_LENGTH) {
      newValidation.content = `Content must be less than ${MAX_CONTENT_LENGTH} characters`;
    }

    if (formData.image) {
      newValidation.image = validateImage(formData.image);
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

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      if (formData.title.trim()) {
        formDataToSend.append('title', formData.title.trim());
      }
      formDataToSend.append('content', formData.content.trim());
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const idField = user.role === 'student' ? 'student_id' : 'tutor_id';
      formDataToSend.append(idField, user.id);

      const response = await api.post('/api/blog/create-blog', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        onSuccess(response.data.blog);
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const charactersLeft = {
    title: MAX_TITLE_LENGTH - formData.title.length,
    content: MAX_CONTENT_LENGTH - formData.content.length
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Post</h2>
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
          
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Title (optional)"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={validation.title ? 'error' : ''}
                maxLength={MAX_TITLE_LENGTH}
                aria-label="Blog title"
              />
              <span className="character-count">
                {charactersLeft.title} characters left
              </span>
            </div>
            {validation.title && (
              <span className="validation-error">{validation.title}</span>
            )}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <textarea
                placeholder="What's on your mind?"
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className={validation.content ? 'error' : ''}
                maxLength={MAX_CONTENT_LENGTH}
                aria-label="Blog content"
              />
              <span className="character-count">
                {charactersLeft.content} characters left
              </span>
            </div>
            {validation.content && (
              <span className="validation-error">{validation.content}</span>
            )}
          </div>

          <div className="form-group">
            <div className={`image-upload ${validation.image ? 'error' : ''}`}>
              <label htmlFor="image-input" className="image-upload-label">
                <i className="bi bi-image"></i>
                <span>Add Photo (Max 5MB)</span>
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
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat spinning"></i>
                  Creating...
                </>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogModal; 