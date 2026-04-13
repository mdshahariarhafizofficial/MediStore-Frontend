import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  text 
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative flex items-center justify-center ${sizes[size]}`}>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full blur-md bg-primary-500/30 animate-pulse"></div>
        {/* Outer Ring */}
        <div className="absolute w-full h-full rounded-full border-[3px] border-gray-200/40 dark:border-gray-700/40"></div>
        {/* Inner Spinning Ring */}
        <div className="absolute w-full h-full rounded-full border-[3px] border-transparent border-t-primary-500 border-r-primary-500 animate-spin"></div>
        {/* Center dot for lg/xl */}
        {(size === 'lg' || size === 'xl') && (
           <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></div>
        )}
      </div>
      {text && (
        <p className="mt-4 text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;