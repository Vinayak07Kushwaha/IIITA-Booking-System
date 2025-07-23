import React, { createContext, useContext, useState, useEffect } from 'react';
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
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (rollNumber, password) => {
    try {
      console.log('Attempting login with API URL:', api.defaults.baseURL);
      
      // Clear any existing tokens before login
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      const response = await api.post('/auth/login', { 
        rollNumber, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store the new token and update headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server response:', error.response.data);
        console.error('Status:', error.response.status);
        return { 
          success: false, 
          message: error.response.data?.message || `Server error: ${error.response.status}`
        };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        return {
          success: false,
          message: 'No response from server. Please check your connection.'
        };
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        return {
          success: false,
          message: 'Failed to make login request'
        };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};