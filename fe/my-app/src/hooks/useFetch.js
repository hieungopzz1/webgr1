import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Custom hook để gọi API và quản lý trạng thái
 * @param {string} url - URL của API
 * @param {Object} options - Các tùy chọn cho request
 * @returns {Object} { data, error, loading, refetch }
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lưu trữ options trong ref để tránh re-render không cần thiết
  const optionsRef = useRef(options);
  // Lưu trữ url đã gọi cuối cùng để tránh race condition
  const activeUrlRef = useRef('');

  // Hàm fetch data
  const fetchData = async (fetchUrl = url, fetchOptions = optionsRef.current) => {
    setLoading(true);
    setError(null);
    
    try {
      activeUrlRef.current = fetchUrl;
      const response = await axios({
        url: fetchUrl,
        ...fetchOptions,
      });
      
      // Kiểm tra nếu request này không phải request mới nhất
      if (activeUrlRef.current !== fetchUrl) return;
      
      setData(response.data);
      return response.data;
    } catch (err) {
      // Kiểm tra nếu request này không phải request mới nhất
      if (activeUrlRef.current !== fetchUrl) return;
      
      setError(err.response?.data || err.message || 'Có lỗi xảy ra');
      return null;
    } finally {
      // Kiểm tra nếu request này không phải request mới nhất
      if (activeUrlRef.current !== fetchUrl) return;
      
      setLoading(false);
    }
  };

  useEffect(() => {
    // Không tự động fetch khi url rỗng
    if (!url) return;
    
    fetchData();

    // Cleanup function để tránh memory leak
    return () => {
      activeUrlRef.current = '';
    };
  }, [url]);

  // Trả về state và hàm refetch
  return { data, error, loading, refetch: fetchData };
};

export default useFetch;
