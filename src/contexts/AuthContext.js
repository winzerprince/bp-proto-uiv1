'use client';

/**
 * @file AuthContext.js
 * @description Authentication context provider with optimized state management
 * Provides user authentication state, login/logout functionality, and role-based access control
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'bp-proto-session-user';

/**
 * Validates and normalizes user data
 * @param {Object} userData - Raw user data
 * @returns {Object} Normalized user data
 */
function normalizeUserData(userData) {
  const { email, name, role } = userData;
  const normalizedRole = role === 'admin' ? 'system_admin' : role || 'general';
  
  return {
    id: `session-${Date.now()}`,
    name: name?.trim() || (email ? email.split('@')[0] : 'ゲストユーザー'),
    email: email || 'guest@datagrid.com',
    role: normalizedRole === 'system_admin' ? 'system_admin' : normalizedRole,
    tenantId: normalizedRole === 'system_admin' ? null : 'tenant-1',
  };
}

/**
 * Loads user session from localStorage
 * @returns {Object|null} User data or null
 */
function loadStoredSession() {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Validate parsed data has required fields
    if (parsed && parsed.id && parsed.email) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse stored session user:', err);
    localStorage.removeItem(STORAGE_KEY);
  }
  
  return null;
}

/**
 * Authentication Provider Component
 * Manages user authentication state and provides auth-related functions
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user session from localStorage on mount
  useEffect(() => {
    const storedUser = loadStoredSession();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  /**
   * Login function
   * @param {Object} credentials - User credentials (email, name, role)
   * @returns {boolean} Success status
   */
  const login = useCallback(({ email, name, role }) => {
    try {
      const userData = normalizeUserData({ email, name, role });
      setUser(userData);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      }
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  /**
   * Logout function
   * Clears user session and removes from localStorage
   */
  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isTenantAdmin: user?.role === 'tenant_admin',
    isSystemAdmin: user?.role === 'system_admin',
    isAdmin: user?.role === 'tenant_admin' || user?.role === 'system_admin',
  }), [user, login, logout, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access auth context
 * @throws {Error} If used outside AuthProvider
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
