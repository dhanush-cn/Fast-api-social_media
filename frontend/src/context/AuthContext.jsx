import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('user_email') || '');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Synchronize localStorage with state
  useEffect(() => {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }, [token]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('user_email', userEmail);
    } else {
      localStorage.removeItem('user_email');
    }
  }, [userEmail]);

  const login = async (email, password) => {
    try {
      const data = await loginApi(email, password);
      setToken(data.access_token);
      setUserEmail(email);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const register = async (email, password) => {
    try {
      await registerApi(email, password);
      // Automatically log in after registration
      return await login(email, password);
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed. Try a different email.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setToken(null);
    setUserEmail('');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userEmail,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
