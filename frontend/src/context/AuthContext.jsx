import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('loansphere_user');
    const token = localStorage.getItem('loansphere_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('loansphere_user');
        localStorage.removeItem('loansphere_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    localStorage.setItem('loansphere_token', data.token);
    localStorage.setItem('loansphere_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const data = response.data;
    localStorage.setItem('loansphere_token', data.token);
    localStorage.setItem('loansphere_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('loansphere_token');
    localStorage.removeItem('loansphere_user');
    setUser(null);
  };

  const isCustomer = () => user?.role === 'CUSTOMER';
  const isOfficer = () => user?.role === 'OFFICER' || user?.role === 'ADMIN';
  const isAdmin = () => user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isCustomer, isOfficer, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
