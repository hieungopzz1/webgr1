import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout/MainLayout';
import AuthLayout from './layouts/authLayout/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/staff/Register';
import AssignTutor from './pages/staff/AssignTutor';
import Settings from './pages/Settings/Settings';
import Message from './pages/Message/Message';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};

// Public Route component
const PublicRoute = ({ children, restricted }) => {
  const isAuthenticated = localStorage.getItem('token');

  if (isAuthenticated && restricted) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute restricted={true}>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/assign-tutor"
            element={
              <ProtectedRoute>
                <AssignTutor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages/:id?"
            element={
              <ProtectedRoute>
                <Message />
              </ProtectedRoute>
            }
          />

          {/* Default route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;