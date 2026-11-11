import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getCsrfCookie } from '../api/axios';
import type { User } from '../types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  whatsapp?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check current session / token on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      // Even without token, check if cookie session is active
      try {
        const response = await api.get('/me');
        if (response.data?.data) {
          setUser(response.data.data);
        }
      } catch {
        setUser(null);
        if (token) {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    await getCsrfCookie();
    const response = await api.post('/login', { email, password });
    const { token, user: userData } = response.data.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    await getCsrfCookie();
    const response = await api.post('/register', data);
    const { token, user: userData } = response.data.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/me');
      if (response.data?.data) {
        setUser(response.data.data);
      }
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
