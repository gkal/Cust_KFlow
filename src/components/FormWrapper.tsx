import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FormProvider, useFormContext } from '../lib/hooks/useFormContext';
import { ValidationError } from './ui/ValidationError';
import { ValidationLoading } from './ui/ValidationLoading';

interface FormWrapperProps {
  children: React.ReactNode;
  redirectPath?: string;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
  redirectOnInvalid?: boolean;
}

interface FormContentProps {
  redirectPath: string;
  children: React.ReactNode;
}

// Inner component that uses the FormContext
const FormContent: React.FC<FormContentProps> = ({ redirectPath, children }) => {
  const { 
    isLoading, 
    isValid, 
    error, 
    customerName,
    customerId,
    submittedAt,
    expiredAt
  } = useFormContext();
  
  const navigate = useNavigate();
  const loggedRef = useRef(false);
  const prevStateRef = useRef({ isLoading, isValid });

  // Debug output - only log when state actually changes
  useEffect(() => {
    const prevState = prevStateRef.current;
    const stateChanged = prevState.isLoading !== isLoading || prevState.isValid !== isValid;
    
    if (!loggedRef.current || stateChanged) {
      console.log('FormContent state:', { 
        isLoading, 
        isValid, 
        error, 
        customerName,
        customerId,
        submittedAt,
        expiredAt
      });
      
      loggedRef.current = true;
      prevStateRef.current = { isLoading, isValid };
    }
  }, [isLoading, isValid, error, customerName, customerId, submittedAt, expiredAt]);

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
  const processedTokenRef = useRef<string | null>(null);
  
  // Create the full token only once to prevent re-renders
  const fullTokenRef = useRef<string | null>(null);
  if (fullTokenRef.current === null && pathToken) {
    fullTokenRef.current = pathToken + location.search;
  }
  
  const fullToken = fullTokenRef.current || '';
  
  // Debug the token from params - only log when token changes
  useEffect(() => {
    if (processedTokenRef.current !== fullToken) {
      // Only log if token appears to be valid
      if (fullToken && fullToken.length > 10) {
        console.log('FormWrapper: Processing token:', { 
          pathToken,
          search: location.search,
          fullToken 
        });
      }
      processedTokenRef.current = fullToken;
    }
  }, [pathToken, location.search, fullToken]);

  return (
    <FormProvider
      onSubmitSuccess={onSubmitSuccess}
      onSubmitError={onSubmitError}
      redirectOnInvalid={redirectOnInvalid}
      redirectPath={redirectPath}
      token={fullToken}
    >
      <FormContent redirectPath={redirectPath}>
        {children}
      </FormContent>
    </FormProvider>
  );
}; 