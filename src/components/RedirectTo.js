'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { MainLayout } from '@/components/layout';
import { LoadingSpinner } from '@/components/ui';

/**
 * Reusable redirect component for authenticated routes
 * Eliminates duplicate redirect logic across inspection/bom/search pages
 * @param {string} to - Destination path to redirect to
 */
export default function RedirectTo({ to }) {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuthGuard();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(to);
    }
  }, [loading, isAuthenticated, router, to]);

  return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </MainLayout>
  );
}
