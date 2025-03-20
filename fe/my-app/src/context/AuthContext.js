import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (token) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/auth/me');
      const userData = response.data;

      if (!userData || !userData.role) {
        throw new Error('Invalid user data');
      }

      console.log('User data loaded:', {
        id: userData.id,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      setUser(userData);
      return true;
    } catch (err) {
      console.error('Load user data error:', err);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        await loadUserData(token);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/api/auth/login', { identifier, password });
      const { token, user: userData } = response.data;
      
      if (!token || !userData || !userData.role) {
        throw new Error('Invalid response format or missing user data');
      }

      localStorage.setItem('token', token);
      
      const success = await loadUserData(token);
      if (!success) {
        throw new Error('Failed to load user data');
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
