import * as React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={`
          flex min-h-[80px] w-full rounded-lg border 
          ${error ? 'border-red-500' : 'border-gray-300'} 
          bg-white px-4 py-3 text-sm 
          placeholder:text-gray-500 
          focus:outline-none focus:ring-2 
          ${error ? 'focus:ring-red-500' : 'focus:ring-primary-500'} 
          focus:border-transparent
          disabled:cursor-not-allowed disabled:opacity-50
          ${className || ''}
        `}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;