import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout/MainLayout';
import AuthLayout from './layouts/authLayout/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/staff/Register';
import AssignTutor from './pages/staff/AssignClass';
import StaffDashboard from './pages/staff/StaffDashboard';
import Settings from './pages/Settings/Settings';
import Message from './pages/Message/Message';
import Home from './pages/Home';
import Notifications from './components/notification/Notification';
import { ROUTES } from './utils/constants';
import { isAuthenticated } from './utils/storage';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};

// Public Route component
const PublicRoute = ({ children, restricted }) => {
  if (isAuthenticated() && restricted) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
};

const App = () => {
  return (
    <>
      <Notifications />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute restricted={true}>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path={ROUTES.REGISTER}
            element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            }
          />
                    <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <StaffDashboard />
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
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${ROUTES.MESSAGES}/:id?`}
            element={
              <ProtectedRoute>
                <Message />
              </ProtectedRoute>
            }
          />

          {/* Default route */}
          <Route
            path={ROUTES.HOME}
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;