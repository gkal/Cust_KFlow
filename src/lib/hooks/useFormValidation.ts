import { useState, useEffect, useCallback, useRef } from 'react';
import { ValidationResult } from '../../types/validation';
import { FormValidationService } from '../services/formValidationService';

interface UseFormValidationProps {
  token?: string | null;
  skipValidation?: boolean;
  redirectOnInvalid?: boolean;
  onValidationComplete?: (result: ValidationResult) => void;
}

interface UseFormValidationReturn {
  isLoading: boolean;
  isValid: boolean;
  customerId?: string;
  customerName?: string;
  error?: string;
  submittedAt?: string;
  expiredAt?: string;
  validateToken: (token: string) => Promise<ValidationResult>;
}

export const useFormValidation = ({ 
  token = null,
  skipValidation = false,
  onValidationComplete
}: UseFormValidationProps = {}): UseFormValidationReturn => {
  const [result, setResult] = useState<ValidationResult>({
    isValid: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const validatedTokenRef = useRef<string | null>(null);
  const isValidatingRef = useRef<boolean>(false);

  const validateToken = useCallback(async (tokenToValidate: string): Promise<ValidationResult> => {
    // Prevent duplicate validations of the same token
    if (validatedTokenRef.current === tokenToValidate || isValidatingRef.current) {
      return result;
    }

    if (!tokenToValidate) {
      const invalidResult: ValidationResult = {
        isValid: false,
        error: 'Invalid or missing token'
      };
      setResult(invalidResult);
      onValidationComplete?.(invalidResult);
      return invalidResult;
    }

    isValidatingRef.current = true;
    setIsLoading(true);
    
    try {
      const validationResult = await FormValidationService.validateFormToken(tokenToValidate);
      
      setResult(validationResult);
      validatedTokenRef.current = tokenToValidate;
      onValidationComplete?.(validationResult);
      return validationResult;
    } catch (error) {
      const errorResult: ValidationResult = {
        isValid: false,
        error: 'Failed to validate token'
      };
      setResult(errorResult);
      onValidationComplete?.(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
      isValidatingRef.current = false;
    }
  }, [result, onValidationComplete]);

  // Run validation only once when token changes
  useEffect(() => {
    if (token && !skipValidation && validatedTokenRef.current !== token) {
      validateToken(token);
    } else if (!token && !skipValidation && validatedTokenRef.current !== token) {
      const noTokenResult = {
        isValid: false,
        error: 'No token provided'
      };
      setResult(noTokenResult);
      validatedTokenRef.current = null;
      onValidationComplete?.(noTokenResult);
    }
  }, [token, skipValidation, validateToken, onValidationComplete]);

  return {
    isLoading,
    validateToken,
    ...result
  };
}; 