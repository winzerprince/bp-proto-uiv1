'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui';
import JobsListContent from './JobsListContent';

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <JobsListContent />
    </Suspense>
  );
}
