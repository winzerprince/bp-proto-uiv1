'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';
import { LoadingSpinner } from '@/components/ui';

export default function InspectionPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        // Redirect to jobs with INSPECTION filter
        router.push('/jobs?type=INSPECTION');
      }
    }
  }, [loading, isAuthenticated, router]);

  return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </MainLayout>
  );
}
