import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthLayout from "./layouts/authLayout/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/staff/Register";
import AssignTutor from "./pages/staff/AssignClass";
import ClassManagement from "./pages/staff/ClassManagement";
import AccountManagement from "./pages/staff/AccountManagement";
import StaffDashboard from "./pages/staff/StaffDashboard";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import Settings from "./pages/Settings/Settings";
import Message from "./pages/Message/Message";
import Home from "./pages/Home";
import Toast from "./components/toast/Toast";
import { useToast } from "./context/ToastContext";
import { registerToastContext } from "./utils/toast";
import { ROUTES } from "./utils/constants";
import "./App.css";
import Timetable from "./pages/Timetable";
import UserTimetable from "./pages/userTimetable";
import Document from "./pages/Document";
import UserDocument from "./pages/userDocument";
import NotFound from "./pages/NotFound";

import {
  AdminRoute,
  TutorRoute,
  StudentRoute,
  TutorStudentRoute,
  AuthenticatedRoute
} from './guards/RouteGuards';

const ToastInitializer = () => {
  const toastContext = useToast();
  
  React.useEffect(() => {
    registerToastContext(toastContext);
  }, [toastContext]);
  
  return null; 
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
      <ToastInitializer />
      <Toast />
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

        {/* Admin-only Routes */}
        <Route
          path={ROUTES.REGISTER}
          element={
            <AdminRoute>
              <Register />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.DASHBOARD("admin")}
          element={
            <AdminRoute>
              <StaffDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/assign-tutor"
          element={
            <AdminRoute>
              <AssignTutor />
            </AdminRoute>
          }
        />
        <Route
          path="/class-management"
          element={
            <AdminRoute>
              <ClassManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/account-management"
          element={
            <AdminRoute>
              <AccountManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <AdminRoute>
              <Timetable />
            </AdminRoute>
          }
        />
        <Route
          path="/document"
          element={
            <AdminRoute>
              <Document />
            </AdminRoute>
          }
        />

        {/* Tutor-only Routes */}
        <Route
          path={ROUTES.DASHBOARD("tutor")}
          element={
            <TutorRoute>
              <TutorDashboard />
            </TutorRoute>
          }
        />

        {/* Student-only Routes */}
        <Route
          path={ROUTES.DASHBOARD("student")}
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />

        {/* Tutor and Student Routes */}
        <Route
          path="/user-timetable"
          element={
            <TutorStudentRoute>
              <UserTimetable />
            </TutorStudentRoute>
          }
        />
        <Route
          path="/user-document"
          element={
            <TutorStudentRoute>
              <UserDocument />
            </TutorStudentRoute>
          }
        />

        {/* Routes for all authenticated users */}
        <Route path="/dashboard" element={<AuthenticatedRoute />} />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <AuthenticatedRoute>
              <Settings />
            </AuthenticatedRoute>
          }
        />
        <Route
          path={`${ROUTES.MESSAGES}/:id?`}
          element={
            <AuthenticatedRoute>
              <Message />
            </AuthenticatedRoute>
          }
        />
        <Route
          path={ROUTES.HOME}
          element={
            <AuthenticatedRoute>
              <Home />
            </AuthenticatedRoute>
          }
        />

        {/* 404 - Not Found Route */}
        <Route path="/not-found" element={<NotFound />} />

        {/* Catch all route - show NotFound instead of redirecting */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
