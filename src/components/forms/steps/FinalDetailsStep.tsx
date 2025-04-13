import React from 'react';
import { useFormContext } from 'react-hook-form';

// Add a type definition for the form errors
interface FinalDetailsErrors {
  finalDetails?: {
    hma?: { message: string };
    certificate?: { message: string };
  };
}

interface FinalDetailsStepProps {
  onBack: () => void;
  onSubmit: () => void;
}

const FinalDetailsStep: React.FC<FinalDetailsStepProps> = ({ onBack, onSubmit }) => {
  const { register, formState: { errors }, watch, trigger } = useFormContext();
  
  // Cast errors to our type
  const typedErrors = errors as unknown as FinalDetailsErrors;
  
  const hmaValue = watch('finalDetails.hma');
  
  const handleSubmit = async () => {
    const isValid = await trigger('finalDetails');
    if (isValid) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center mb-2">
          <input
            id="hma"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            {...register('finalDetails.hma')}
          />
          <label htmlFor="hma" className="ml-2 block text-sm text-gray-700">
            Έχετε ΗΜΑ; (Ηλεκτρονικό Μητρώο Αποβλήτων)
          </label>
        </div>
        {typedErrors.finalDetails?.hma && (
          <p className="mt-2 text-sm text-red-600">
            {typedErrors.finalDetails.hma.message}
          </p>
        )}
      </div>

      {hmaValue && (
        <div>
          <label htmlFor="certificate" className="block text-sm font-medium text-gray-700 mb-1">
            Αριθμός Πιστοποιητικού ΗΜΑ
          </label>
          <input
            id="certificate"
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            {...register('finalDetails.certificate')}
          />
          {typedErrors.finalDetails?.certificate && (
            <p className="mt-2 text-sm text-red-600">
              {typedErrors.finalDetails.certificate.message}
            </p>
          )}
        </div>
      )}

      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Πίσω
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Υποβολή
        </button>
      </div>
    </div>
  );
};

export default FinalDetailsStep;