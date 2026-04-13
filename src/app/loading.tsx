import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-8">
      <LoadingSpinner size="lg" text="Loading contents..." />
    </div>
  );
}
