import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/inputField/InputField';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import Button from '../../components/button/Button';
import useAuth from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { isAuthenticated } from '../../utils/storage';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError } = useNotifications();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isAuthenticated()) {
      navigate('/home', { replace: true });
      return;
    }
    
    setLoading(true);

    try {
      const { email, password } = formData;
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/home', { replace: true });
      } else {
        showError(result.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      showError('Có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Sign In</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <InputField
            label="Username"
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
            Forgot Password?
          </Link>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
