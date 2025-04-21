import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from './useFormContext';
import { FormLinkStatus } from '../../types/validation';

interface UseStepperFormOptions {
  initialStep?: number;
  totalSteps: number;
  onStepChange?: (step: number) => void;
  onComplete?: (data: Record<string, any>) => void;
  defaultData?: Record<string, any>;
}

interface UseStepperFormReturn {
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  completeForm: (data: Record<string, any>) => Promise<boolean>;
  rejectForm: (reason?: string) => Promise<boolean>;
  formData: Record<string, any>;
  updateFormData: (data: Record<string, any>) => void;
  isSubmitting: boolean;
  customerId: string | undefined;
  customerName: string | undefined;
  resetForm: () => void;
}

export const useStepperForm = ({
  initialStep = 0,
  totalSteps,
  onStepChange,
  onComplete,
  defaultData = {}
}: UseStepperFormOptions): UseStepperFormReturn => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [formData, setFormData] = useState<Record<string, any>>(defaultData);
  
  const { 
    customerId, 
    customerName,
    submitForm,
    isSubmitting,
    isValid,
    token
  } = useFormContext();
  
  // Log critical information
  useEffect(() => {
    console.log('Stepper form initialized with customer:', { customerId, customerName, isValid });
  }, [customerId, customerName, isValid]);
  
  // Validate step bounds
  useEffect(() => {
    if (currentStep < 0) {
      setCurrentStep(0);
    } else if (currentStep >= totalSteps) {
      setCurrentStep(totalSteps - 1);
    }
  }, [currentStep, totalSteps]);
  
  // Call the onStepChange callback when step changes
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);
  
  // Ensure customer ID is always part of form data when available
  useEffect(() => {
    if (customerId && !formData.customerId) {
      setFormData(prevData => ({
        ...prevData,
        customerId
      }));
    }
  }, [customerId, formData]);
  
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);
  
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);
  
  const updateFormData = useCallback((data: Record<string, any>) => {
    setFormData((prevData: Record<string, any>) => ({
      ...prevData,
      ...data,
      ...(customerId ? { customerId } : {})
    }));
  }, [customerId]);
  
  const resetForm = useCallback(() => {
    setCurrentStep(initialStep);
    setFormData(defaultData);
  }, [initialStep, defaultData]);
  
  const completeForm = useCallback(async (data: Record<string, any>): Promise<boolean> => {
    if (!customerId) {
      console.error('Cannot submit form: No customer ID available');
      return false;
    }
    
    if (!token) {
      console.error('Cannot submit form: No form token available');
      return false;
    }
    
    // Update the final form data
    const finalData = {
      ...formData,
      ...data,
      customerId
    };
    
    console.log('Submitting form with data:', finalData);
    
    // Call the onComplete callback with the complete data
    onComplete?.(finalData);
    
    // Submit the form with approved status
    return await submitForm('approved', finalData);
  }, [formData, customerId, token, submitForm, onComplete]);
  
  const rejectForm = useCallback(async (reason?: string): Promise<boolean> => {
    return await submitForm('rejected', { reason, customerId });
  }, [submitForm, customerId]);
  
  // Calculate progress percentage
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);
  
  return {
    currentStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    progress,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    completeForm,
    rejectForm,
    formData,
    updateFormData,
    isSubmitting,
    customerId,
    customerName,
    resetForm
  };
}; 