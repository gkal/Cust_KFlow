import React from 'react';

interface SuccessStepProps {
  offerId: string;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ offerId }) => {
  return (
    <div className="text-center py-8 space-y-6">
      <svg className="h-16 w-16 text-teal-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      
      <h2 className="text-2xl font-bold text-gray-900">
        Offer Submitted Successfully!
      </h2>
      
      <p className="text-gray-600 max-w-md mx-auto">
        Thank you for submitting your offer. Our team will review it shortly and get back to you.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-md inline-block mx-auto">
        <p className="text-sm text-gray-500">Reference Number:</p>
        <p className="font-mono font-medium">{offerId}</p>
      </div>
      
      <p className="text-sm text-gray-600">
        Please save this reference number for future correspondence.
      </p>
    </div>
  );
};

export default SuccessStep;