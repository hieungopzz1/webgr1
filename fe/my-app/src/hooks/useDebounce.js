import { useState, useEffect } from 'react';

/**
 * Custom hook để debounce giá trị - giảm số lần thực hiện một hành động
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian trễ tính bằng milliseconds
 * @returns {any} Giá trị sau khi đã debounce
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Tạo timer để cập nhật giá trị sau khoảng thời gian delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function để xóa timer khi value hoặc delay thay đổi
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
