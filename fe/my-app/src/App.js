import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout/MainLayout";
import AuthLayout from "./layouts/authLayout/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/staff/Register";
import AssignTutor from "./pages/staff/AssignClass";
import ClassManagement from "./pages/staff/ClassManagement";
import StaffDashboard from "./pages/staff/StaffDashboard";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import Settings from "./pages/Settings/Settings";
import Message from "./pages/Message/Message";
import Home from "./pages/Home";
// import Notifications from "./components/notification/Notification";
import { ROUTES } from "./utils/constants";
import { isAuthenticated } from "./utils/storage";
import "./App.css";
import Timetable from "./pages/Timetable";
import UserTimetable from "./pages/userTimetable";
import Document from "./pages/Document";
import UserDocument from "./pages/userDocument";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const user = isAuthenticated(); // Giả sử hàm này trả về user object
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Nếu người dùng cố truy cập `/dashboard`, điều hướng họ đến dashboard theo role
  if (window.location.pathname === "/dashboard") {
    return <Navigate to={ROUTES.DASHBOARD(user.role)} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};
// Public Route component
const PublicRoute = ({ children, restricted }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  const isUserAuthenticated = !!token && !!userData;
  
  if (isUserAuthenticated && restricted) {
    console.log('User is authenticated, redirecting from public route...');
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <AuthLayout>{children}</AuthLayout>;
};

const App = () => {
  return (
    <>
      {/* <Notifications /> */}
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
        {/* Dashboard theo role */}
        <Route
          path={ROUTES.DASHBOARD("admin")}
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DASHBOARD("tutor")}
          element={
            <ProtectedRoute>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DASHBOARD("student")}
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Nếu ai vào `/dashboard`, điều hướng họ đến dashboard theo role */}
        <Route path="/dashboard" element={<ProtectedRoute />} />
        <Route
          path="/assign-tutor"
          element={
            <ProtectedRoute>
              <AssignTutor />
            </ProtectedRoute>
          }
        />
        
        {/* Class Management Route */}
        <Route
          path="/class-management"
          element={
            <ProtectedRoute>
              <ClassManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/timetable"
          element={
            <ProtectedRoute>
              <Timetable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-timetable"
          element={
            <ProtectedRoute>
              <UserTimetable />
            </ProtectedRoute>
          }
        />

        {/* Document Routes */}
        <Route
          path="/document"
          element={
            <ProtectedRoute>
              <Document />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-document"
          element={
            <ProtectedRoute>
              <UserDocument />
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
    </>
  );
};

export default App;
