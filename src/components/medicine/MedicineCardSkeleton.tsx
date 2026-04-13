import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

const MedicineCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[460px]">
      {/* Image Skeleton */}
      <Skeleton className="h-52 w-full rounded-none" />

      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category Badge */}
        <Skeleton className="h-5 w-24 mb-3 rounded-full" />

        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-2 rounded-lg" />
        <Skeleton className="h-6 w-1/2 mb-4 rounded-lg" />

        {/* Manufacturer */}
        <div className="flex items-center mb-4">
           <Skeleton className="h-4 w-4 rounded-full mr-2" />
           <Skeleton className="h-4 w-32 rounded-md" />
        </div>

        {/* Description Placeholder */}
        <Skeleton className="h-4 w-full mb-2 rounded-md" />
        <Skeleton className="h-4 w-5/6 mb-4 rounded-md" />

        {/* Rating Placeholder */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
             <Skeleton className="h-8 w-24 mb-1 rounded-lg" />
             <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-9 w-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineCardSkeleton;
