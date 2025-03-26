// import db from '../db.json';

// // const api = {
// //   get: (endpoint) => {
// //     return new Promise((resolve) => {
// //       setTimeout(() => {
// //         resolve({ data: db });
// //       }, 300);
// //     });
// //   }
// // };

import axios from 'axios';
import { ROUTES } from './constants';
import { getToken, clearAuthData } from './storage';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = ROUTES.LOGIN;
    }

    return Promise.reject(error);
  }
);

export default api;
