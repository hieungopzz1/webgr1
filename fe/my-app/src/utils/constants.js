/**
 * Các hằng số được sử dụng trong toàn bộ ứng dụng
 */

// Auth related
export const LOCAL_STORAGE_TOKEN_KEY = 'token';
export const LOCAL_STORAGE_USER_DATA_KEY = 'userData';

// API routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
  },
  BLOG: {
    CREATE: '/api/blog/create-blog',
    GET_ALL: '/api/blog/all',
    GET_BY_ID: (id) => `/api/blog/${id}`,
    UPDATE: (id) => `/api/blog/${id}`,
    DELETE: (id) => `/api/blog/${id}`,
  },
  USER: {
    GET_ALL: '/api/users',
    GET_BY_ID: (id) => `/api/users/${id}`,
    UPDATE: (id) => `/api/users/${id}`,
  },
  MESSAGE: {
    GET_ALL: '/api/messages',
    GET_CONVERSATION: (userId) => `/api/messages/${userId}`,
    SEND: '/api/messages/send',
  },
  NOTIFICATION: {
    GET_ALL: '/api/notification/notifications',
    MARK_READ: (id) => `/api/notification/mark-read/${id}`,
    MARK_ALL_READ: '/api/notification/mark-all-read',
  },
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  SETTINGS: '/settings',
  MESSAGES: '/messages',
  MESSAGE_DETAIL: (id) => `/messages/${id}`,
  CLASS_MANAGEMENT: '/class-management',
  DASHBOARD: (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "/admin/dashboard";
      case "tutor":
        return "/tutor/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/dashboard";
    }
  },
  PROFILE: '/profile',
};


// User roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  TUTOR: 'Tutor',
  STUDENT: 'Student'
};

// Form validation
export const VALIDATION = {
  MAX_TITLE_LENGTH: 100,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
};

// UI constants
export const UI = {
  SIDEBAR_COLLAPSED_WIDTH: '60px',
  SIDEBAR_EXPANDED_WIDTH: '240px',
  TOAST_AUTO_DISMISS_TIME: 5000, // 5 seconds
};
