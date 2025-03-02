import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/authLayout/AuthLayout';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import api from '../../utils/api';
import './Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Login failed. Please try again.'
      );
    }
  };

  return (
    <AuthLayout>
      <div className="login-page">
        <h2 className="login-title">Log In</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <InputField
            label="Email or Username"
            name="identifier"
            type="text"
            placeholder="Enter your email or username..."
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Log In</Button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          <p>
            Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
