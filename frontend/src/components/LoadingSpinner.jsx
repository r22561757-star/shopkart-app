import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-[#76685A] space-y-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[#80664A]`} />
      {message && <p className="text-sm font-medium tracking-wide">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
