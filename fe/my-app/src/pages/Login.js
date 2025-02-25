import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      const response = await axios.get('http://localhost:3001/users');
      const users = response.data;
      const user = users.find(
        (u) =>
          (u.email === identifier || u.username === identifier) &&
          u.password === password
      );

      if (!user) {
        setError("Invalid credentials. Please try again.");
        return;
      }
      if (user.role === 'student') {
        navigate('/student-dashboard');
      } else if (user.role === 'tutor') {
        navigate('/tutor-dashboard');
      } else if (user.role === 'admin') {
        navigate('/');
      } else {
        setError("User role not recognized.");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Log In</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">Email or Username</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or username..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password..."
            />
          </div>
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </div>
          <button type="submit" className="login-btn">Log In</button>
        </form>
        <div className="signup-link">
          <p>
            Don't have an account? <Link to="/register">Sign up now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
