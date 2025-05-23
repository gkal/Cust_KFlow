import React, { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormValidation } from './useFormValidation';
import { useFormSubmission } from './useFormSubmission';
import { FormLinkStatus } from '../../types/validation';

interface FormContextType {
  isLoading: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  customerId?: string;
  customerName?: string;
  error?: string;
  token: string | null;
  submitForm: (status: FormLinkStatus['status'], data?: any) => Promise<boolean>;
  submissionError: string | null;
  revalidate: () => Promise<void>;
  submittedAt?: string;
  expiredAt?: string;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{
  children: ReactNode;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
  redirectOnInvalid?: boolean;
  redirectPath?: string;
  token?: string;
}> = ({ 
  children, 
  onSubmitSuccess, 
  onSubmitError,
  redirectOnInvalid = true,
  redirectPath = '/',
  token: providedToken
}) => {
  const navigate = useNavigate();
  // Get token from URL parameters if not provided as prop
  const { token: pathToken } = useParams<{ token: string }>();
  const initialToken = providedToken || pathToken || null;
  
  // Use ref to store the token to prevent state changes on re-renders
  const tokenRef = useRef<string | null>(initialToken);
  const token = tokenRef.current;
  
  // Track validation completeness and prevent double redirects
  const [validationComplete, setValidationComplete] = useState(false);
  const firstRenderRef = useRef(true);
  const redirectedRef = useRef(false);
  
  const {
    isLoading,
    isValid,
    error,
    customerId,
    customerName,
    validateToken,
    submittedAt,
    expiredAt
  } = useFormValidation({ 
    token,
    onValidationComplete: () => {
      setValidationComplete(true);
    }
  });
  
  const {
    isSubmitting,
    submitForm,
    error: submissionError
  } = useFormSubmission({
    onSuccess: onSubmitSuccess,
    onError: onSubmitError,
    token
  });
  
  // First render setup - only run once
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
    }
  }, [token]);
  
  // Handle redirection for invalid tokens only after validation is complete
  useEffect(() => {
    // Only redirect if:
    // 1. Validation is complete
    // 2. Not loading
    // 3. Not valid
    // 4. Redirect option is enabled
    // 5. Not already redirected
    // 6. Error is not related to form already submitted or expired
    const isSubmissionError = error?.includes('έχει ήδη υποβληθεί');
    const isExpirationError = error?.includes('έχει λήξει');
    const shouldShowCustomError = isSubmissionError || isExpirationError;
    
    if (validationComplete && 
        !isLoading && 
        !isValid && 
        redirectOnInvalid && 
        !redirectedRef.current && 
        !shouldShowCustomError) {
      redirectedRef.current = true;
      navigate(redirectPath, { replace: true });
    }
  }, [isLoading, isValid, navigate, redirectPath, redirectOnInvalid, error, validationComplete]);
  
  // Revalidation function - reset all flags
  const revalidate = async () => {
    if (token) {
      setValidationComplete(false);
      redirectedRef.current = false;
      await validateToken(token);
    }
  };
  
  return (
    <FormContext.Provider value={{
      isLoading,
      isValid,
      isSubmitting,
      customerId,
      customerName,
      error,
      token,
      submitForm,
      submissionError,
      revalidate,
      submittedAt,
      expiredAt
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = (): FormContextType => {
  const context = useContext(FormContext);
  
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  
  return context;
}; 