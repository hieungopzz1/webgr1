import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/inputField/InputField';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import Button from '../../components/button/Button';
import useAuth from '../../hooks/useAuth';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h2 className="login-title">Đăng nhập</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="Nhập email của bạn..."
          value={formData.email}
          onChange={handleChange}
        />

        <PasswordInput
          label="Mật khẩu"
          name="password"
          placeholder="Nhập mật khẩu của bạn..."
          value={formData.password}
          onChange={handleChange}
        />

        {error && <div className="login-error">{error}</div>}

        <Button 
          type="submit" 
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <div className="auth-links">
        <Link to="/forgot-password" className="auth-link">
          Quên mật khẩu?
        </Link>
        <p>
          Chưa có tài khoản?{' '}
          <Link to="/register" className="auth-link">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
