import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Modal from '../../components/modal/Modal';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import { USER_ROLES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import './AccountManagement.css';

const AccountManagement = () => {
  // State for users data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filtering
  const [filters, setFilters] = useState({
    role: '',
    major: '',
    searchTerm: ''
  });
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: USER_ROLES.STUDENT,
    student_ID: '',
    tutor_ID: '',
    major: 'IT'
  });
  
  // State for avatar
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const toast = useToast();
  
  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { role, major } = filters;
      let endpoint = '/api/admin/get-users';
      
      // If we have filters
      if (role || major) {
        endpoint = '/api/admin/filter-users';
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (major) params.append('major', major);
        endpoint += `?${params.toString()}`;
      }
      
      const response = await api.get(endpoint);
      if (response.data && response.data.users) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError(`Error fetching users: ${err.message}`);
      toast.error(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);
  
  // Effect for initial load
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Filtered users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const studentId = user.student_ID?.toLowerCase() || '';
      const tutorId = user.tutor_ID?.toLowerCase() || '';
      
      return fullName.includes(searchTermLower) || 
             email.includes(searchTermLower) ||
             studentId.includes(searchTermLower) ||
             tutorId.includes(searchTermLower);
    });
  }, [users, filters.searchTerm]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle role change
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData(prev => ({
      ...prev,
      role,
      // Reset role-specific fields when role changes
      student_ID: role === USER_ROLES.STUDENT ? prev.student_ID : '',
      tutor_ID: role === USER_ROLES.TUTOR ? prev.tutor_ID : ''
    }));
  };
  
  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: USER_ROLES.STUDENT,
      student_ID: '',
      tutor_ID: '',
      major: 'IT'
    });
    setAvatar(null);
    setAvatarPreview(null);
    setSelectedUser(null);
  };
  
  // Open modal for editing a user
  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Password is not pre-filled
      role: user.role || USER_ROLES.STUDENT,
      student_ID: user.student_ID || '',
      tutor_ID: user.tutor_ID || '',
      major: user.major || 'IT'
    });
    
    // Chỉ set avatarPreview khi user có avatar
    if (user.avatar && user.avatar.trim() !== '') {
      const avatarUrl = `${process.env.REACT_APP_API_URL}${user.avatar}`;
      
      // Kiểm tra xem avatar có tồn tại không trước khi hiển thị
      fetch(avatarUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            setAvatarPreview(avatarUrl);
          } else {
            setAvatarPreview(null);
          }
        })
        .catch(() => {
          setAvatarPreview(null);
        });
    } else {
      setAvatarPreview(null);
    }
    
    setIsModalOpen(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };
  
  // Validate form
  const validateForm = () => {
    const { firstName, lastName, email, password, role, student_ID, tutor_ID, major } = formData;
    
    if (!firstName || !lastName || !email) {
      toast.error('Please fill in all required fields.');
      return false;
    }
    
    if (role === USER_ROLES.STUDENT && !student_ID) {
      toast.error('Student ID is required for student accounts.');
      return false;
    }
    
    if (role === USER_ROLES.TUTOR && !tutor_ID) {
      toast.error('Tutor ID is required for tutor accounts.');
      return false;
    }
    
    if ((role === USER_ROLES.STUDENT || role === USER_ROLES.TUTOR) && !major) {
      toast.error('Major is required.');
      return false;
    }
    
    if (!email.includes('@')) {
      toast.error('Invalid email address.');
      return false;
    }
    
    return true;
  };
  
  // Handle update user
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add common fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      
      // Add role-specific fields
      formDataToSend.append('role', formData.role);
      
      if (formData.role === USER_ROLES.STUDENT) {
        formDataToSend.append('student_ID', formData.student_ID);
        formDataToSend.append('major', formData.major);
      } else if (formData.role === USER_ROLES.TUTOR) {
        formDataToSend.append('tutor_ID', formData.tutor_ID);
        formDataToSend.append('major', formData.major);
      }
      
      // Add password if provided
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }
      
      // Add avatar if provided
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      
      // Update existing user
      await api.put(`/api/admin/update-user/${selectedUser._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success(`Successfully updated account for ${formData.email}`);
      
      // Close modal and refresh data
      handleCloseModal();
      fetchUsers();
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete the account for ${userName}?`)) {
      setLoading(true);
      
      try {
        await api.delete(`/api/admin/delete-user/${userId}`);
        toast.success(`Successfully deleted account for ${userName}`);
        fetchUsers();
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        toast.error(`Error deleting account: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="account-management-container">
      <h2 className="page-title">Account Management</h2>
      
      {/* Filters */}
      <div className="filters-container">
        <div className="search-container">
          <InputField 
            type="text"
            placeholder="Search by name, email, or ID..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            fullWidth
            startAdornment={<i className="fas fa-search"></i>}
            endAdornment={
              filters.searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                  type="button"
                >
                  ×
                </button>
              )
            }
          />
        </div>
        
        <div className="filter-options">
          <div className="filter-group">
            <label htmlFor="role-filter">Role:</label>
            <select
              id="role-filter"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value={USER_ROLES.STUDENT}>Students</option>
              <option value={USER_ROLES.TUTOR}>Tutors</option>
              <option value={USER_ROLES.ADMIN}>Admins</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="major-filter">Major:</label>
            <select
              id="major-filter"
              name="major"
              value={filters.major}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Majors</option>
              <option value="IT">IT</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
            </select>
          </div>
          
          <Button 
            onClick={() => setFilters({ role: '', major: '', searchTerm: '' })}
            variant="secondary"
            size="small"
          >
            Clear Filters
          </Button>
        </div>
      </div>
      
      {/* Users List */}
      <div className="users-list-container">
        {loading && <div className="loading-indicator">Loading users...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="no-results">No users found matching your criteria.</div>
        )}
        
        {!loading && !error && filteredUsers.length > 0 && (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>ID</th>
                <th>Major</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr 
                  key={user._id} 
                  className="user-row"
                  onClick={() => handleOpenEditModal(user)}
                >
                  <td className="user-info">
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL}${user.avatar}`} 
                          alt={`${user.firstName}'s avatar`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.querySelector('.avatar-placeholder').style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="avatar-placeholder" 
                        style={{ display: user.avatar ? 'none' : 'flex' }}
                      >
                        {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                      </div>
                    </div>
                    <span className="user-name">{user.firstName} {user.lastName}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.student_ID || user.tutor_ID || '-'}</td>
                  <td>{user.major || '-'}</td>
                  <td className="actions-cell">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click event
                        handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`);
                      }}
                      variant="danger"
                      size="small"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Edit User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={'Edit Account'}
      >
        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-row">
            <InputField
              label="First Name*"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <InputField
              label="Last Name*"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <InputField
            label="Email*"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          
          <PasswordInput
            label={"Password (leave blank to keep unchanged)"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
          
          <div className="form-group">
            <label>Account Type*</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
              className="form-select"
              disabled={true} // Cannot change role when editing
            >
              <option value={USER_ROLES.STUDENT}>Student</option>
              <option value={USER_ROLES.TUTOR}>Tutor</option>
              <option value={USER_ROLES.ADMIN}>Admin</option>
            </select>
          </div>
          
          {formData.role === USER_ROLES.STUDENT && (
            <>
              <InputField
                label="Student ID*"
                name="student_ID"
                value={formData.student_ID}
                onChange={handleInputChange}
                required
              />
              
              <div className="form-group">
                <label>Major*</label>
                <select
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="IT">IT</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                </select>
              </div>
            </>
          )}
          
          {formData.role === USER_ROLES.TUTOR && (
            <>
              <InputField
                label="Tutor ID*"
                name="tutor_ID"
                value={formData.tutor_ID}
                onChange={handleInputChange}
                required
              />
              
              <div className="form-group">
                <label>Major*</label>
                <select
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="IT">IT</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                </select>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label>Avatar</label>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="file-input"
            />
            <div className="avatar-preview-container">
              {avatarPreview ? (
                <div className="avatar-preview">
                  <img 
                    src={avatarPreview} 
                    alt="Avatar Preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      // Hiển thị placeholder hoặc thông báo lỗi
                      const placeholder = document.createElement('div');
                      placeholder.className = 'avatar-preview-placeholder';
                      placeholder.innerText = selectedUser ? 
                        `${selectedUser.firstName?.[0] || ''}${selectedUser.lastName?.[0] || ''}` : 
                        'Avatar';
                      e.target.parentNode.appendChild(placeholder);
                    }}
                  />
                </div>
              ) : (
                <div className="avatar-preview avatar-preview-empty">
                  <div className="avatar-preview-placeholder">
                    {selectedUser ? 
                      `${selectedUser.firstName?.[0] || ''}${selectedUser.lastName?.[0] || ''}` :
                      'Add Avatar'}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <Button
              type="button"
              onClick={handleCloseModal}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Update Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountManagement; 