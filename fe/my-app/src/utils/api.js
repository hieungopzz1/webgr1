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
 
 const api = axios.create({
   baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
