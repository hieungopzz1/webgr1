import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_DATA_KEY } from './constants';

/**
 * Utility cho các thao tác với localStorage
 * Tập trung hóa việc đọc/ghi để dễ dàng thay đổi cách lưu trữ sau này nếu cần
 */

/**
 * Lưu token vào localStorage
 * @param {string} token - JWT token
 */
export const saveToken = (token) => {
  localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
};

/**
 * Lấy token từ localStorage
 * @returns {string|null} JWT token hoặc null nếu không tồn tại
 */
export const getToken = () => {
  return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
};

/**
 * Lưu thông tin người dùng vào localStorage
 * @param {Object} userData - Thông tin người dùng
 */
export const saveUserData = (userData) => {
  localStorage.setItem(LOCAL_STORAGE_USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Lấy thông tin người dùng từ localStorage
 * @returns {Object|null} Thông tin người dùng hoặc null nếu không tồn tại
 */
export const getUserData = () => {
  const userData = localStorage.getItem(LOCAL_STORAGE_USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Xóa thông tin xác thực khỏi localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  localStorage.removeItem(LOCAL_STORAGE_USER_DATA_KEY);
};

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa
 * @returns {boolean} true nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Lưu trữ dữ liệu vào localStorage với khóa tùy chỉnh
 * @param {string} key - Khóa
 * @param {any} value - Giá trị (sẽ được chuyển thành JSON)
 */
export const setItem = (key, value) => {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
};

/**
 * Lấy dữ liệu từ localStorage với khóa tùy chỉnh
 * @param {string} key - Khóa
 * @param {boolean} parseJSON - Có parse JSON hay không
 * @returns {any} Giá trị lưu trữ
 */
export const getItem = (key, parseJSON = true) => {
  const value = localStorage.getItem(key);
  if (!value) return null;
  
  if (parseJSON) {
    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }
  
  return value;
};

/**
 * Xóa dữ liệu từ localStorage với khóa tùy chỉnh
 * @param {string} key - Khóa
 */
export const removeItem = (key) => {
  localStorage.removeItem(key);
};
