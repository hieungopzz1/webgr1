import React from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout/MainLayout";
import { getUserData, isAuthenticated } from "../utils/storage";
import { USER_ROLES } from "../utils/constants";
import NotFound from "../pages/NotFound";

/**
 * Component bảo vệ route dựa trên danh sách roles được cấp quyền
 * @param {Object} props - Component props
 * @param {string[]} props.allowedRoles - Mảng các role được phép truy cập
 * @param {React.ReactNode} props.children - Component con
 * @param {boolean} [props.redirectToNotFound=true] - Điều hướng đến trang NotFound khi không có quyền
 * @returns {React.ReactElement}
 */
export const RoleBasedRoute = ({ 
  allowedRoles, 
  children, 
  redirectToNotFound = true
}) => {
  // Kiểm tra xác thực
  const authenticated = isAuthenticated();
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Lấy thông tin người dùng
  const userData = getUserData();
  
  // Kiểm tra quyền
  if (!userData || !allowedRoles.includes(userData.role)) {
    console.warn(`Access denied: User role ${userData?.role} not in allowed roles [${allowedRoles.join(', ')}]`);
    
    // Chuyển hướng đến trang NotFound nếu yêu cầu
    if (redirectToNotFound) {
      return <NotFound />;
    }
    
    // Nếu không yêu cầu NotFound, chuyển hướng về dashboard tương ứng với role
    const dashboardRoute = userData?.role 
      ? `/dashboard` 
      : "/";
    
    return <Navigate to={dashboardRoute} replace />;
  }
  
  // Nếu có quyền, hiển thị nội dung
  return <MainLayout>{children}</MainLayout>;
};

/**
 * Component bảo vệ route chỉ cho Admin
 */
export const AdminRoute = ({ children, redirectToNotFound }) => (
  <RoleBasedRoute 
    allowedRoles={[USER_ROLES.ADMIN]} 
    redirectToNotFound={redirectToNotFound}
  >
    {children}
  </RoleBasedRoute>
);

/**
 * Component bảo vệ route chỉ cho Tutor
 */
export const TutorRoute = ({ children, redirectToNotFound }) => (
  <RoleBasedRoute 
    allowedRoles={[USER_ROLES.TUTOR]} 
    redirectToNotFound={redirectToNotFound}
  >
    {children}
  </RoleBasedRoute>
);

/**
 * Component bảo vệ route chỉ cho Student
 */
export const StudentRoute = ({ children, redirectToNotFound }) => (
  <RoleBasedRoute 
    allowedRoles={[USER_ROLES.STUDENT]} 
    redirectToNotFound={redirectToNotFound}
  >
    {children}
  </RoleBasedRoute>
);

/**
 * Component bảo vệ route cho Tutor và Student
 */
export const TutorStudentRoute = ({ children, redirectToNotFound }) => (
  <RoleBasedRoute 
    allowedRoles={[USER_ROLES.TUTOR, USER_ROLES.STUDENT]} 
    redirectToNotFound={redirectToNotFound}
  >
    {children}
  </RoleBasedRoute>
);

/**
 * Component bảo vệ route cho Staff (Admin + Tutor)
 */
export const StaffRoute = ({ children, redirectToNotFound }) => (
  <RoleBasedRoute 
    allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.TUTOR]} 
    redirectToNotFound={redirectToNotFound}
  >
    {children}
  </RoleBasedRoute>
);

/**
 * Component bảo vệ route yêu cầu đăng nhập (không kiểm tra role)
 */
export const AuthenticatedRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

/**
 * Hook kiểm tra quyền người dùng
 * @param {string|string[]} requiredRoles - Role hoặc mảng roles cần kiểm tra
 * @returns {boolean} - true nếu có quyền, false nếu không
 */
export const useHasPermission = (requiredRoles) => {
  const userData = getUserData();
  
  if (!userData) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userData.role);
  }
  
  return userData.role === requiredRoles;
};

/**
 * Component chỉ hiển thị nội dung nếu người dùng có quyền
 */
export const PermissionGuard = ({ children, requiredRoles }) => {
  const hasPermission = useHasPermission(requiredRoles);
  
  return hasPermission ? <>{children}</> : null;
}; 