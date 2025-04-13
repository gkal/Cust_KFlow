import React from 'react';
import { useFormContext } from 'react-hook-form';

// Add a type definition for the form errors
interface CustomerErrors {
  customerDetails?: {
    address?: { message: string };
    postalCode?: { message: string };
    town?: { message: string };
  };
}

interface CustomerStepProps {
  onNext: () => void;
  customerName: string;
}

const CustomerStep: React.FC<CustomerStepProps> = ({ onNext, customerName }) => {
  const { register, formState: { errors }, trigger } = useFormContext();
  
  // Cast errors to our type
  const typedErrors = errors as unknown as CustomerErrors;
  
  const handleNext = async () => {
    const isValid = await trigger('customerDetails');
    if (isValid) {
      onNext();
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Customer Details</h2>
      <p className="text-gray-600">Please provide your address information.</p>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Customer Info</h3>
        <p className="text-gray-800">{customerName}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Διεύθυνση
          </label>
          <input
            id="address"
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            {...register('customerDetails.address')}
          />
          {typedErrors.customerDetails?.address && (
            <p className="mt-2 text-sm text-red-600">
              {typedErrors.customerDetails.address.message}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Ταχυδρομικός Κώδικας
          </label>
          <input
            id="postalCode"
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            {...register('customerDetails.postalCode')}
          />
          {typedErrors.customerDetails?.postalCode && (
            <p className="mt-2 text-sm text-red-600">
              {typedErrors.customerDetails.postalCode.message}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-1">
            Πόλη
          </label>
          <input
            id="town"
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            {...register('customerDetails.town')}
          />
          {typedErrors.customerDetails?.town && (
            <p className="mt-2 text-sm text-red-600">
              {typedErrors.customerDetails.town.message}
            </p>
          )}
        </div>
      </div>
      
      <div className="pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Επόμενο
        </button>
      </div>
    </div>
  );
};

export default CustomerStep;