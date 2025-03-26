import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { API_ROUTES } from '../utils/constants';
import { 
  saveToken, 
  saveUserData, 
  getUserData, 
  clearAuthData 
} from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = getUserData();

        if (userData) {
          const response = await api.get(API_ROUTES.AUTH.ME);
          if (response.data) {
            setUser(response.data);
          } else {
            clearAuthData();
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, { email, password });
      const { token, user: userData } = response.data;
      
      if (token && userData) {
        saveToken(token);
        saveUserData(userData);
        setUser(userData);
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
