'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook for protecting routes that require authentication
 * Consolidates the repeated auth guard pattern across multiple pages
 * @param {string} redirectPath - Where to redirect if not authenticated (default: '/login')
 * @returns {Object} - Auth state { user, loading, isAuthenticated, isAdmin, isTenantAdmin, isSystemAdmin }
 */
export function useAuthGuard(redirectPath = '/login') {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading, isAuthenticated } = auth;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectPath);
    }
  }, [loading, isAuthenticated, router, redirectPath]);

  return auth;
}
