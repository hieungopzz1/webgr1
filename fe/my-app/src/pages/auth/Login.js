import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/authLayout/AuthLayout';
import InputField from '../../components/inputField/InputField';
import PasswordInput from '../../components/passwordInput/PasswordInput';
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
      const response = await api.get('/');
      const users = response.data.users || [];
      const foundUser = users.find(
        (user) =>
          (user.email === identifier || user.username === identifier) &&
          user.password === password
      );
      if (foundUser) {
        localStorage.setItem('token', foundUser.id);
        navigate('/');
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    }
  };  

  return (
    <AuthLayout>
      <div className="login-page">
        <h2 className="login-title">Log In</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <InputField
            label="Email or Username"
            name="identifier"
            type="text"
            placeholder="Enter your email or username..."
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <PasswordInput
            label="Password"
            name="password"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="login-error">{error}</div>}
          <Button type="submit">Log In</Button>
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
