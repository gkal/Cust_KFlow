import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import CustomerStep from './steps/CustomerStep';
import WasteDetailsStep from './steps/WasteDetailsStep';
import FinalDetailsStep from './steps/FinalDetailsStep';
import SuccessStep from './steps/SuccessStep';

// Define simple string steps for the progress UI
const steps = ['Customer Details', 'Waste Details', 'Final Details', 'Success'];

interface OfferFormProps {
  customerName: string;
  onFormSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
}

const OfferForm: React.FC<OfferFormProps> = ({ customerName, onFormSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    error?: string;
    offerId?: string; // Add the offerId property to the type
  } | null>(null);

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      customerDetails: {
        id: '',
        address: '',
        postalCode: '',
        town: ''
      },
      wasteDetails: {
        wasteType: '',
        whoTransport: 'company',
        loading: ''
      },
      finalDetails: {
        hma: 'no',
        certificate: 'no'
      }
    }
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: any) => {
    try {
      const result = await onFormSubmit(data);
      
      // Add a mock offerId for the success page
      setSubmissionResult({
        ...result,
        offerId: 'OFF-' + Math.floor(Math.random() * 1000000)
      });
      
      if (result.success) {
        // Move to success step on successful submission
        setCurrentStep(3);
        console.log('Form submitted successfully');
      }
    } catch (error) {
      setSubmissionResult({
        success: false,
        error: 'An unexpected error occurred'
      });
    }
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinalSubmit = async () => {
    // Submit the form
    methods.handleSubmit(onSubmit)();
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Form header */}
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h2 className="text-lg font-medium text-gray-900">Offer Form</h2>
        <div className="mt-1 flex justify-between">
          <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
          <p className="text-sm font-medium text-gray-700">{steps[currentStep]}</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1">
        <div 
          className="bg-teal-600 h-1 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl mx-auto p-4">
          {currentStep === 0 && (
            <CustomerStep onNext={handleNextStep} customerName={customerName} />
          )}
          
          {currentStep === 1 && (
            <WasteDetailsStep onNext={handleNextStep} onBack={handlePrevStep} />
          )}
          
          {currentStep === 2 && (
            <FinalDetailsStep 
              onBack={handlePrevStep} 
              onSubmit={handleFinalSubmit}
            />
          )}
          
          {currentStep === 3 && (
            <SuccessStep 
              offerId={submissionResult?.offerId || ''}
            />
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default OfferForm;