import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/inputField/InputField';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import Button from '../../components/button/Button';
import api from '../../utils/api';
import { USER_ROLES } from '../../utils/constants';
import './Register.css';

const RoleSelect = ({ value, onChange }) => (
  <div className="form-group">
    <label>Account Type:</label>
    <select
      name="role"
      value={value}
      onChange={onChange}
      className="role-select"
    >
      <option value={USER_ROLES.STUDENT}>Student</option>
      <option value={USER_ROLES.TUTOR}>Tutor</option>
      <option value={USER_ROLES.ADMIN}>Admin</option>
    </select>
  </div>
);

const AvatarUpload = ({ onFileChange, preview }) => (
  <div className="avatar-upload">
    <label>Avatar (optional):</label>
    <input 
      type="file" 
      accept="image/*" 
      onChange={onFileChange} 
      className="avatar-input"
    />
    {preview && (
      <div className="avatar-preview">
        <img src={preview} alt="Avatar Preview" />
      </div>
    )}
  </div>
);

const StudentFields = ({ studentId, major, onChange }) => (
  <>
    <InputField
      label="Student ID"
      name="student_ID"
      type="text"
      placeholder="Enter student ID..."
      value={studentId}
      onChange={onChange}
      required
    />

    <InputField
      label="Major"
      name="major"
      type="text"
      placeholder="Enter major..."
      value={major}
      onChange={onChange}
      required
    />
  </>
);

const useFormValidation = (formData, setError) => {
  const validate = () => {
    const { firstName, lastName, email, password, role, student_ID, major } = formData;

    if (!firstName || !lastName || !email || !password || !role) {
      setError('Please fill in all required fields.');
      return false;
    }

    if (role === USER_ROLES.STUDENT && (!student_ID || !major)) {
      setError('Student ID and Major are required for student accounts.');
      return false;
    }

    if (!email.includes('@')) {
      setError('Invalid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    return true;
  };

  return { validate };
};

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: USER_ROLES.STUDENT,
    student_ID: '',
    major: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { validate } = useFormValidation(formData, setError);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      major: ''
    });
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const { firstName, lastName, email, password, role, student_ID, major } = formData;

      const formDataToSend = new FormData();
      formDataToSend.append('firstName', firstName);
      formDataToSend.append('lastName', lastName);
      formDataToSend.append('email', email);
      formDataToSend.append('password', password);
      formDataToSend.append('role', role);
      
      if (role === USER_ROLES.STUDENT) {
        formDataToSend.append('student_ID', student_ID);
        formDataToSend.append('major', major);
      }

      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }

      await api.post('/api/admin/create-account', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(`Successfully created ${role} account for ${email}`);
      resetForm();

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('Error creating account:', err);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to create account. Please try again.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const StatusMessage = () => (
    <>
      {error && <div className="register-error" role="alert">{error}</div>}
      {success && <div className="register-success" role="status">{success}</div>}
    </>
  );

  return (
    <div className="register-page">
      <h2 className="register-title">Create New Account</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <RoleSelect 
          value={formData.role} 
          onChange={handleChange} 
        />

        <AvatarUpload 
          onFileChange={handleAvatarChange}
          preview={avatarPreview}
        />

        {formData.role === USER_ROLES.STUDENT && (
          <StudentFields
            studentId={formData.student_ID}
            major={formData.major}
            onChange={handleChange}
          />
        )}

        <InputField
          label="First Name"
          name="firstName"
          type="text"
          placeholder="Enter first name..."
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <InputField
          label="Last Name"
          name="lastName"
          type="text"
          placeholder="Enter last name..."
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="Enter email address..."
          value={formData.email}
          onChange={handleChange}
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Enter password..."
          value={formData.password}
          onChange={handleChange}
          required
        />

        <StatusMessage />

        <Button 
          type="submit" 
          disabled={loading}
          variant="primary"
          size="medium"
          fullWidth
          className="register-button"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
};

export default Register;