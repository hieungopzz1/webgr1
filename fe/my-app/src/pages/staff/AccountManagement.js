import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../utils/api';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Modal from '../../components/modal/Modal';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import { USER_ROLES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AccountManagement.css';
import { useUser } from '../../context/UserContext';

// UserAvatar Component
const UserAvatar = ({ user }) => (
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
);

// FilterSection Component
const FilterSection = ({ filters, handleFilterChange, handleClearFilters }) => (
  <div className="filters-container">
    <div className="search-container">
      <InputField 
        type="text"
        placeholder="Search by name, email, or ID..."
        value={filters.searchTerm}
        onChange={(e) => handleFilterChange({ target: { name: 'searchTerm', value: e.target.value }})}
        fullWidth
        startAdornment={<i className="fas fa-search"></i>}
        endAdornment={
          filters.searchTerm && (
            <button 
              className="clear-search"
              onClick={() => handleFilterChange({ target: { name: 'searchTerm', value: '' }})}
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
        onClick={handleClearFilters}
        variant="secondary"
        size="small"
      >
        Clear Filters
      </Button>
    </div>
  </div>
);

// UserTable Component
const UserTable = ({ users, onEdit, onDelete }) => (
  <div className="table-responsive">
    <table className="table table-hover table-striped">
      <thead className="table-light">
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
        {users.map(user => (
          <tr 
            key={user._id} 
            onClick={() => onEdit(user)}
            style={{cursor: 'pointer'}}
          >
            <td>
              <div className="d-flex align-items-center gap-2">
                <UserAvatar user={user} />
                <span className="user-name">{user.firstName} {user.lastName}</span>
              </div>
            </td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              {user.role === USER_ROLES.STUDENT ? user.student_ID : 
               user.role === USER_ROLES.TUTOR ? user.tutor_ID : '-'}
            </td>
            <td>{user.major || (user.role === USER_ROLES.ADMIN ? 'N/A' : '-')}</td>
            <td>
              <Button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click event
                  onDelete(user._id, `${user.firstName} ${user.lastName}`);
                }}
                variant="danger"
                size="small"
                className="btn btn-sm btn-danger"
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// EditUserForm Component
const EditUserForm = ({ 
  formData, 
  handleInputChange, 
  handleRoleChange, 
  handleAvatarChange, 
  avatarPreview, 
  selectedUser, 
  loading,
  onSubmit,
  onCancel
}) => {
  // Add getInitials function
  const getInitials = () => {
    if (selectedUser) {
      const firstInitial = selectedUser.firstName?.[0] || '';
      const lastInitial = selectedUser.lastName?.[0] || '';
      return firstInitial + lastInitial;
    }
    return '';
  };

  return (
    <form onSubmit={onSubmit} className="account-form">
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
                  const placeholder = e.target.parentNode.querySelector('.avatar-preview-placeholder');
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
            </div>
          ) : (
            <div className="avatar-preview">
              <div className="avatar-preview-placeholder">
                {getInitials()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="form-actions">
        <Button
          type="button"
          onClick={onCancel}
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
  );
};

const AccountManagement = () => {
  const { users, loading: userLoading, fetchUsers, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ role: '', major: '', searchTerm: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const toast = useToast();
  
  // Load initial data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        await fetchUsers();
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        toast.error(`Failed to load users: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [fetchUsers, toast]);
  
  // Filtered users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (!filters.searchTerm) return true;
      
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
  
  // Event handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleClearFilters = () => {
    setFilters({ role: '', major: '', searchTerm: '' });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData(prev => ({
      ...prev,
      role,
      student_ID: role === USER_ROLES.STUDENT ? prev.student_ID : '',
      tutor_ID: role === USER_ROLES.TUTOR ? prev.tutor_ID : ''
    }));
  };
  
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
  
  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      role: user.role || USER_ROLES.STUDENT,
      student_ID: user.student_ID || '',
      tutor_ID: user.tutor_ID || '',
      major: user.major || 'IT'
    });
    
    if (user.avatar && user.avatar.trim() !== '') {
      const avatarUrl = `${process.env.REACT_APP_API_URL}${user.avatar}`;
      
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
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };
  
  const validateForm = () => {
    const { firstName, lastName, email, role, student_ID, tutor_ID, major } = formData;
    
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('role', formData.role);
      
      if (formData.role === USER_ROLES.STUDENT) {
        formDataToSend.append('student_ID', formData.student_ID);
        formDataToSend.append('major', formData.major);
      } else if (formData.role === USER_ROLES.TUTOR) {
        formDataToSend.append('tutor_ID', formData.tutor_ID);
        formDataToSend.append('major', formData.major);
      }
      
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }
      
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      
      // Update user using context
      await updateUser(selectedUser._id, formDataToSend);
      
      toast.success(`Successfully updated account for ${formData.email}`);
      handleCloseModal();
      
      // Refresh users list
      await fetchUsers();
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(`Error updating user: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete the account for ${userName}?`)) {
      setLoading(true);
      setError(null);
      
      try {
        await api.delete(`/api/admin/delete-user/${userId}`);
        toast.success(`Successfully deleted account for ${userName}`);
        await fetchUsers(); // Refresh users list
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        toast.error(`Error deleting account: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="account-management-container">
      <h2 className="page-title">Account Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading || userLoading ? (
        <div className="loading-indicator">Loading users...</div>
      ) : (
        <>
          <FilterSection 
            filters={filters} 
            handleFilterChange={handleFilterChange} 
            handleClearFilters={handleClearFilters}
          />
          
          <div className="users-list-container">
            {users.length === 0 ? (
              <div className="no-results">No users found.</div>
            ) : (
              <UserTable 
                users={filteredUsers} 
                onEdit={handleOpenEditModal} 
                onDelete={handleDeleteUser}
              />
            )}
          </div>
        </>
      )}
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={'Edit Account'}
      >
        <EditUserForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleRoleChange={handleRoleChange}
          handleAvatarChange={handleAvatarChange}
          avatarPreview={avatarPreview}
          selectedUser={selectedUser}
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default AccountManagement; 