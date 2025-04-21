import React from 'react';

interface ValidationLoadingProps {
  className?: string;
}

export const ValidationLoading: React.FC<ValidationLoadingProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
        <p className="text-gray-600 text-sm font-medium">Validating form link...</p>
      </div>
    </div>
  );
}; 