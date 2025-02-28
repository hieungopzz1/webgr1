import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../layouts/authLayout/AuthLayout';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import { getUsers } from '../../services/api';
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
      const users = await getUsers();
      // Trong thực tế, bạn nên mã hóa mật khẩu và xử lý logic xác thực tại backend
      const user = users.find(
        (u) =>
          (u.email === identifier || u.username === identifier) &&
          u.password === password
      );
      if (!user) {
        setError("Invalid credentials. Please try again.");
        return;
      }
      setError('');
      if (user.role === 'student') {
        navigate('/student-dashboard');
      } else if (user.role === 'tutor') {
        navigate('/tutor-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        setError("User role not recognized.");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error(err);
    }
  };

  return (
    <AuthLayout>
      <div className="login">
        <h2 className="login-title">Log In</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <InputField
            label="Email or Username"
            name="identifier"
            placeholder="Enter your email or username..."
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </div>
          <Button type="submit">Log In</Button>
        </form>
        <div className="signup-link">
          <p>
            Don't have an account? <Link to="/register">Sign up now</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
