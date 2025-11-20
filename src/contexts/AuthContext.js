'use client';

import { createContext, useContext, useState, useEffect, startTransition } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'bp-proto-session-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          startTransition(() => {
            setUser(parsed);
          });
        } catch (err) {
          console.warn('Failed to parse stored session user', err);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
    startTransition(() => {
      setLoading(false);
    });
  }, []);

  const login = ({ email, name, role }) => {
    const normalizedRole = role === 'admin' ? 'system_admin' : role || 'general';
    const userData = {
      id: `session-${Date.now()}`,
      name: name?.trim() || (email ? email.split('@')[0] : 'ゲストユーザー'),
      email: email || 'guest@datagrid.com',
      role: normalizedRole === 'system_admin' ? 'system_admin' : normalizedRole,
      tenantId: normalizedRole === 'system_admin' ? null : 'tenant-1',
    };

    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
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
