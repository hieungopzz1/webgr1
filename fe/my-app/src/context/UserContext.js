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

  const deleteUser = useCallback(async (userId) => {
    try {
      const response = await api.delete(`/api/admin/delete-user/${userId}`);
      
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      return response.data;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }, []);

  const refreshUsersIfNeeded = useCallback(async (forceRefresh = false) => {
    try {
      if (loading && !forceRefresh) return users;
      
      const response = await api.get('/api/admin/get-users');
      if (response.data?.users) {
        const newUsers = response.data.users;
        const hasChanges = () => {
          if (users.length !== newUsers.length) return true;
          
          const userMap = {};
          users.forEach(user => {
            userMap[user._id] = user;
          });
          
          for (const newUser of newUsers) {
            const existingUser = userMap[newUser._id];
            if (!existingUser) return true;
            
            if (
              existingUser.firstName !== newUser.firstName ||
              existingUser.lastName !== newUser.lastName ||
              existingUser.email !== newUser.email ||
              existingUser.role !== newUser.role
            ) {
              return true;
            }
          }
          
          return false;
        };
        
        if (forceRefresh || hasChanges()) {
          setUsers(newUsers);
        }
        
        return newUsers;
      }
      return users;
    } catch (err) {
      console.error('Error refreshing users:', err);
      throw err;
    }
  }, [users, loading]);

  const value = {
    users,
    loading,
    fetchUsers,
    updateUser,
    deleteUser,
    refreshUsersIfNeeded
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