import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      api.token = token;
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login({ email, password });
      api.setToken(response.token);
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear all stored data
    api.removeToken();
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any other related storage
    sessionStorage.clear();
    
    console.log('User logged out successfully');
  };

  // Role-based permission checks
  const canAccess = (module, action = 'view') => {
    if (!user) return false;

   // Update the permissions object - Remove reports from students
// Update the permissions object - Remove courses access from all except program_leader
// Update the permissions object - Add courses access back for principal_lecturer
const permissions = {
  student: {
    dashboard: ['view'],
    monitoring: ['view'],
    rating: ['view', 'submit'],
    reports: [],
    classes: [],
    courses: [], // No access to courses
    lecturers: []
  },
  lecturer: {
    dashboard: ['view'],
    monitoring: ['view'],
    rating: ['view', 'submit'],
    classes: ['view', 'manage', 'create'],
    reports: ['view', 'create', 'edit_own'],
    courses: [], // No access to courses
    lecturers: ['view_peers']
  },
  principal_lecturer: {
    dashboard: ['view'],
    monitoring: ['view', 'analyze'],
    rating: ['view', 'submit', 'review'],
    classes: ['view', 'manage', 'assign', 'oversee'],
    reports: ['view', 'create', 'edit_own', 'review', 'feedback'], // Can give feedback
    courses: ['view_all', 'oversee'], // Can view and oversee courses
    lecturers: ['view', 'monitor', 'evaluate']
  },
  program_leader: {
    dashboard: ['view'],
    monitoring: ['view', 'manage', 'analyze'],
    rating: ['view', 'submit', 'manage', 'analyze'],
    classes: ['view', 'manage', 'assign', 'oversee', 'create'],
    reports: ['view', 'create', 'edit_any', 'review', 'approve'],
    courses: ['view_all', 'manage', 'create', 'delete', 'assign'],
    lecturers: ['view', 'manage', 'assign', 'monitor', 'evaluate']
  }
};

    return permissions[user.role]?.[module]?.includes(action) || false;
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};