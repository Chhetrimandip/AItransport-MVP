import { createContext, useContext, useState } from 'react';
import api from '../utils/api';
import { useToast } from '@chakra-ui/react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const toast = useToast();

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/users/login', { 
        email, 
        password 
      });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
        });
        
        return data;
      }
    } catch (error) {
      console.error('Login error:', error.response?.data);
      
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        status: 'error',
        duration: 3000,
      });
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    toast({
      title: 'Logged out successfully',
      status: 'info',
      duration: 3000,
    });
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 