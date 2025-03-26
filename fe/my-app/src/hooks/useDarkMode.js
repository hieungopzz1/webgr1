import { useState, useEffect } from 'react';

/**
 * Custom hook để quản lý chế độ sáng/tối
 * @param {boolean} defaultValue - Giá trị mặc định cho chế độ tối (true = tối, false = sáng)
 * @returns {Array} [darkMode, setDarkMode] - State và function để thay đổi chế độ
 */
const useDarkMode = (defaultValue = false) => {
  // Kiểm tra localStorage khi khởi tạo
  const getInitialMode = () => {
    // Kiểm tra giá trị trong localStorage
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }

    // Kiểm tra prefers-color-scheme nếu không có giá trị trong localStorage
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }

    // Trả về giá trị mặc định nếu không có điều kiện nào ở trên
    return defaultValue;
  };

  const [darkMode, setDarkMode] = useState(getInitialMode);

  // Cập nhật document.body và localStorage khi darkMode thay đổi
  useEffect(() => {
    // Thêm hoặc xóa class dark-mode ở body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Lưu giá trị vào localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Lắng nghe sự thay đổi prefers-color-scheme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setDarkMode(e.matches);
    };

    // Thêm event listener nếu browser hỗ trợ
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback cho các trình duyệt cũ
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return [darkMode, setDarkMode];
};

export default useDarkMode;
