import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import Courses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import Assignments from './pages/student/Assignments';
import Profile from './pages/student/Profile';
import Settings from './pages/student/Settings';
import TutorDashboard from './pages/tutor/TutorDashboard';
import ManageCourses from './pages/tutor/ManageCourses';
import AssignmentReview from './pages/tutor/AssignmentReview';
import StudentProgress from './pages/tutor/StudentProgress';
import StaffDashboard from './pages/staff/StaffDashboard';
import UserManagement from './pages/staff/UserManagement';
import CourseApproval from './pages/staff/CourseApproval';
import Reports from './pages/staff/Reports';
import TutorClasses from './pages/tutor/ClassesList/TutorClasses';
import ClassStudents from './pages/tutor/StudentsList/ClassStudents';

const Routes = () => (
  <Switch>
    {/* Auth Routes */}
    <Route path="/auth/login" component={Login} />
    <Route path="/auth/register" component={Register} />
    <Route path="/auth/forgot-password" component={ForgotPassword} />

    {/* Student Routes */}
    <Route path="/student/dashboard" component={StudentDashboard} />
    <Route path="/student/courses" component={Courses} />
    <Route path="/student/course-detail" component={CourseDetail} />
    <Route path="/student/assignments" component={Assignments} />
    <Route path="/student/profile" component={Profile} />
    <Route path="/student/settings" component={Settings} />

    {/* Tutor Routes */}
    <Route path="/tutor/dashboard" component={TutorDashboard} />
    <Route path="/tutor/manage-courses" component={ManageCourses} />
    <Route path="/tutor/assignment-review" component={AssignmentReview} />
    <Route path="/tutor/student-progress" component={StudentProgress} />
    <Route path="/tutor/classes" component={TutorClasses} />
    <Route path="/tutor/class/:classId/students" component={ClassStudents} />

    {/* Staff Routes */}
    <Route path="/staff/dashboard" component={StaffDashboard} />
    <Route path="/staff/user-management" component={UserManagement} />
    <Route path="/staff/course-approval" component={CourseApproval} />
    <Route path="/staff/reports" component={Reports} />
  </Switch>
);

export default Routes;