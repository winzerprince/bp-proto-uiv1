'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getUserById } from '@/lib/mock-data';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (storedUserId) {
      const userData = getUserById(storedUserId);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = (userId) => {
    const userData = getUserById(userId);
    if (userData) {
      setUser(userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', userId);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isTenantAdmin: user?.role === 'tenant_admin',
    isSystemAdmin: user?.role === 'system_admin',
    isAdmin: user?.role === 'tenant_admin' || user?.role === 'system_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
