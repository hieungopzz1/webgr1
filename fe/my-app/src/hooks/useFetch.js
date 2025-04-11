import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Custom hook for making API calls and managing state
 * @param {string} url - API URL
 * @param {Object} options - Request options
 * @returns {Object} { data, error, loading, refetch }
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Store options in ref to avoid unnecessary re-renders
  const optionsRef = useRef(options);
  // Store the last called URL to avoid race conditions
  const activeUrlRef = useRef('');

  // Function to fetch data
  const fetchData = async (fetchUrl = url, fetchOptions = optionsRef.current) => {
    setLoading(true);
    setError(null);
    
    try {
      activeUrlRef.current = fetchUrl;
      const response = await axios({
        url: fetchUrl,
        ...fetchOptions,
      });
      
      // Check if this request is not the most recent one
      if (activeUrlRef.current !== fetchUrl) return;
      
      setData(response.data);
      return response.data;
    } catch (err) {
      // Check if this request is not the most recent one
      if (activeUrlRef.current !== fetchUrl) return;
      
      setError(err.response?.data || err.message || 'An error occurred');
      return null;
    } finally {
      // Check if this request is not the most recent one
      if (activeUrlRef.current !== fetchUrl) return;
      
      setLoading(false);
    }
  };

  useEffect(() => {
    // Don't auto-fetch when URL is empty
    if (!url) return;
    
    fetchData();

    // Cleanup function to avoid memory leak
    return () => {
      activeUrlRef.current = '';
    };
  }, [url]);

  // Return state and refetch function
  return { data, error, loading, refetch: fetchData };
};

export default useFetch;
