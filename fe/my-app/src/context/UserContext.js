import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import { getUserData } from '../utils/storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentUser = getUserData(); // Get current user information

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      const userRole = currentUser?.role;
      
      if (userRole === 'Admin') {
        // Admin can view all users
        response = await api.get('/api/admin/get-users');
      } else if (userRole === 'Tutor') {
        // Tutor can view their students
        response = await api.get('/api/tutor/students');
      } else if (userRole === 'Student') {
        // Students can view their classmates
        response = await api.get('/api/student/classmates');
      } else {
        throw new Error('Unauthorized user role');
      }
      
      if (response.data?.users) {
        setUsers(response.data.users);
      } else if (response.data) {
        // Handle different response formats from different APIs
        setUsers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      const headers = userData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      let response;
      const userRole = currentUser?.role;
      
      if (userRole === 'Admin') {
        // Admin can update any user
        response = await api.put(`/api/admin/update-user/${userId}`, userData, { headers });
      } else if (userRole === 'Tutor' || userRole === 'Student') {
        // Tutors and Students can only update their own profile
        if (userId !== currentUser.id) {
          throw new Error('You can only update your own profile');
        }
        response = await api.put(`/api/users/update-profile`, userData, { headers });
      } else {
        throw new Error('Unauthorized user role');
      }
      
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
  }, [currentUser]);

  const deleteUser = useCallback(async (userId) => {
    try {
      // Only Admin can delete users
      if (currentUser?.role !== 'Admin') {
        throw new Error('Only administrators can delete users');
      }
      
      const response = await api.delete(`/api/admin/delete-user/${userId}`);
      
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      return response.data;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }, [currentUser]);

  const refreshUsersIfNeeded = useCallback(async (forceRefresh = false) => {
    try {
      if (loading && !forceRefresh) return users;
      
      let response;
      const userRole = currentUser?.role;
      
      if (userRole === 'Admin') {
        response = await api.get('/api/admin/get-users');
      } else if (userRole === 'Tutor') {
        response = await api.get('/api/tutor/students');
      } else if (userRole === 'Student') {
        response = await api.get('/api/student/classmates');
      } else {
        throw new Error('Unauthorized user role');
      }
      
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
  }, [users, loading, currentUser]);

  // Create appropriate value object based on user role
  const value = {
    users,
    loading,
    fetchUsers,
    updateUser,
    // Only provide deleteUser to Admin
    ...(currentUser?.role === 'Admin' && { deleteUser }),
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