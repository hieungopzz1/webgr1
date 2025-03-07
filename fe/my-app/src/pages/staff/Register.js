import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/authLayout/AuthLayout';
import InputField from '../../components/inputField/InputField';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import Button from '../../components/button/Button';
import api from '../../utils/api';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { firstName, lastName, email, password, role } = formData;

      // Validation
      if (!firstName || !lastName || !email || !password || !role) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const endpoint = `/api/admin/create-account`;
      const response = await api.post(endpoint, {
        email,
        password,
        fullName: `${firstName} ${lastName}`,
        role
      });

      setSuccess(`Successfully created ${role} account for ${email}`);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Student'
      });
    } catch (err) {
      console.error('Account creation error:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }

    console.log(formData);
  };

  return (
    <AuthLayout>
      <div className="register-page">
        <h2 className="register-title">Create New Account</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Account Type:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="Student">Student</option>
              <option value="Tutor">Tutor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <InputField
            label="First Name"
            name="firstName"
            type="text"
            placeholder="Enter firstname..."
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <InputField
            label="Last Name"
            name="lastName"
            type="text"
            placeholder="Enter lastname..."
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

          {error && <div className="register-error">{error}</div>}
          {success && <div className="register-success">{success}</div>}

          <Button 
            type="submit" 
            disabled={loading}
            className="register-button"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Register;