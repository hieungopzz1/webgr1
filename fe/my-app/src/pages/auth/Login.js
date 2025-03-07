import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/authLayout/AuthLayout';
import InputField from '../../components/inputField/InputField';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import Button from '../../components/button/Button';
import api from '../../utils/api';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      const { email, password } = formData;

      if (!email || !password) {
        setError('Please fill in all required fields.');
        return;
      }

      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));

      switch (user.role) {
        case 'Student':
          navigate('/student/dashboard');
          break;
        case 'Tutor':
          navigate('/tutor/dashboard');
          break;
        case 'Admin':
          navigate('/register');
          break;
        default:
          setError('Invalid user role');
          return;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-page">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email..."
            value={formData.email}
            onChange={handleChange}
          />

          <PasswordInput
            label="Password"
            name="password"
            placeholder="Enter your password..."
            value={formData.password}
            onChange={handleChange}
          />

          {error && <div className="login-error">{error}</div>}

          <Button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
