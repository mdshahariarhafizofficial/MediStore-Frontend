import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all
              ${error ? 'border-error-500 bg-error-50 dark:bg-error-900/10' : 'border-gray-200 dark:border-gray-700'}
              ${icon ? 'pl-10' : ''}
              ${props.disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70' : 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white'}
              ${className}
            `}
            {...props}
          />
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-error-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error-600 dark:text-error-400 flex items-center animate-fade-in">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;