import React from 'react';
import { useFormContext } from 'react-hook-form';

// Add a type definition for the form errors
interface WasteDetailsErrors {
  wasteDetails?: {
    wasteType?: { message: string };
    whoTransport?: { message: string };
    loading?: { message: string };
  };
}

interface WasteDetailsStepProps {
  onNext: () => void;
  onBack: () => void;
}

const WasteDetailsStep: React.FC<WasteDetailsStepProps> = ({ onNext, onBack }) => {
  const { register, formState: { errors }, trigger } = useFormContext();
  
  // Cast errors to our type
  const typedErrors = errors as unknown as WasteDetailsErrors;
  
  const handleNext = async () => {
    const isValid = await trigger('wasteDetails');
    if (isValid) onNext();
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Waste Details</h2>
      <p className="text-gray-600">Please provide details about waste type and transportation.</p>
      
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="wasteType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Τύπος Αποβλήτου
          </label>
          <select
            id="wasteType"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            {...register('wasteDetails.wasteType')}
          >
            <option value="">Επιλέξτε τύπο αποβλήτου</option>
            <option value="glass">Γυαλί</option>
            <option value="plastic">Πλαστικό</option>
            <option value="paper">Χαρτί</option>
            <option value="metal">Μέταλλο</option>
          </select>
          {typedErrors.wasteDetails?.wasteType && (
            <p className="mt-2 text-sm text-red-600">
              {typedErrors.wasteDetails.wasteType.message}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ποιος θα μεταφέρει τα απόβλητα
          </label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                id="whoTransport-kronos"
                type="radio"
                value="true"
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                {...register('wasteDetails.whoTransport')}
              />
              <label htmlFor="whoTransport-kronos" className="ml-3 block text-sm font-medium text-gray-700">
                Kronos
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="whoTransport-customer"
                type="radio"
                value="false"
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                {...register('wasteDetails.whoTransport')}
              />
              <label htmlFor="whoTransport-customer" className="ml-3 block text-sm font-medium text-gray-700">
                Πελάτης
              </label>
            </div>
          </div>
          
          {typedErrors.wasteDetails?.whoTransport && (
            <p className="mt-2 text-sm text-red-600">
              {typedErrors.wasteDetails.whoTransport.message}
            </p>
          )}
        </div>
        
        <div>
          <label 
            htmlFor="loading"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Φόρτωση
          </label>
          <textarea
            id="loading"
            rows={3}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            placeholder="Πληροφορίες φόρτωσης"
            {...register('wasteDetails.loading')}
          />
          {typedErrors.wasteDetails?.loading && (
            <p className="mt-2 text-sm text-red-600">
              {typedErrors.wasteDetails.loading.message}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WasteDetailsStep;