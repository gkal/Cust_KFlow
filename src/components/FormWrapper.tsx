import React, { useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FormProvider, useFormContext } from '../lib/hooks/useFormContext';
import { ValidationError } from './ui/ValidationError';
import { ValidationLoading } from './ui/ValidationLoading';
import { sendExpiredLinkNotification } from '../lib/services/emailApiService';

interface FormWrapperProps {
  children: React.ReactNode;
  redirectPath?: string;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
  redirectOnInvalid?: boolean;
}

interface FormContentProps {
  children: React.ReactNode;
}

// Inner component that uses the FormContext
const FormContent: React.FC<FormContentProps> = ({ children }) => {
  const { 
    isLoading, 
    isValid, 
    error, 
    customerName,
    customerId,
    submittedAt,
    expiredAt,
    token
  } = useFormContext();
  
  const emailSentRef = useRef(false);

  // Send email notification when an expired link is detected
  useEffect(() => {
    const isExpirationError = error?.includes('έχει λήξει');
    
    if (!isLoading && !isValid && isExpirationError && expiredAt && !emailSentRef.current && token) {
      // Send the notification email
      sendExpiredLinkNotification({
        customerId,
        customerName,
        expiredAt,
        currentTime: new Date(),
        token
      });
      
      // Mark as sent to prevent duplicate emails
      emailSentRef.current = true;
    }
  }, [isLoading, isValid, error, expiredAt, customerId, customerName, token]);

  if (isLoading) {
    return <ValidationLoading />;
  }

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <ValidationError 
          error={error} 
          submittedAt={submittedAt}
          expiredAt={expiredAt}
          customerId={customerId}
        />
      </div>
    );
  }

  return (
    <div className="form-container">
      {children}
    </div>
  );
};

// Main wrapper that provides the form context
export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  redirectPath = '/404',
  onSubmitSuccess,
  onSubmitError,
  redirectOnInvalid = true
}) => {
  // Get token from URL parameters
  const { token: pathToken } = useParams<{ token: string }>();
  const location = useLocation();
  
  // Create the full token only once to prevent re-renders
  const fullTokenRef = useRef<string | null>(null);
  if (fullTokenRef.current === null && pathToken) {
    fullTokenRef.current = pathToken + location.search;
  }
  
  const fullToken = fullTokenRef.current || '';

  return (
    <FormProvider
      onSubmitSuccess={onSubmitSuccess}
      onSubmitError={onSubmitError}
      redirectOnInvalid={redirectOnInvalid}
      redirectPath={redirectPath}
      token={fullToken}
    >
      <FormContent>
        {children}
      </FormContent>
    </FormProvider>
  );
}; 