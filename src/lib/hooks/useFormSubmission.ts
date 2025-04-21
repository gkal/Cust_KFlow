import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FormLinkService } from '../services/formLinkService';
import { FormLinkStatus } from '../../types/validation';

interface UseFormSubmissionProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  token?: string | null;
}

interface UseFormSubmissionReturn {
  isSubmitting: boolean;
  submitForm: (status: FormLinkStatus['status'], data?: any) => Promise<boolean>;
  error: string | null;
}

export const useFormSubmission = ({
  onSuccess,
  onError,
  token: propToken
}: UseFormSubmissionProps = {}): UseFormSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  
  // Use token from props if provided, otherwise try to get from URL
  const params = new URLSearchParams(location.search);
  const urlToken = params.get('token');
  const token = propToken || urlToken;
  
  const submitForm = async (
    status: FormLinkStatus['status'], 
    data?: any
  ): Promise<boolean> => {
    if (!token) {
      const errorMsg = 'Form token not found';
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Here you would typically save the form data to your database first
      // This is a placeholder for where you would save the actual form data
      
      // Then update the form link status
      const { success, error } = await FormLinkService.updateFormLinkStatus(token, status);
      
      if (!success) {
        setError(error || 'Failed to submit form');
        onError?.(error || 'Failed to submit form');
        return false;
      }
      
      onSuccess?.();
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    submitForm,
    error
  };
}; 