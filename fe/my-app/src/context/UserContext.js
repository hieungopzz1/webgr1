import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/get-users');
      if (response.data?.users) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      const headers = userData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      const response = await api.put(`/api/admin/update-user/${userId}`, userData, { headers });
      
      if (response.data) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, ...response.data } : user
          )
        );
        return response.data;
      }
      throw new Error('No data received from server');
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }, []);

  const value = {
    users,
    loading,
    fetchUsers,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 