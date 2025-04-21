import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FormLinkService } from '../services/formLinkService';
import { FormLinkStatus } from '../../types/validation';
import { supabase } from '../supabaseClient';

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
      // Save form data to the database
      if (data) {
        // Default system user ID - using a known valid UUID from the database
        const systemUserId = "84045ca4-07c7-42b4-a025-97534bc35839";
        
        // Create offer data record in the offers table
        const { error: insertError } = await supabase
          .from('offers')
          .insert({
            customer_id: data.customerId,
            source: data.source || 'Form',
            created_by: systemUserId, // Using a valid UUID instead of 'system' string
            waste_type: data.wasteType,
            address: data.address,
            tk: data.postalCode,
            town: data.city,
            who_transport: data.whoTransports,
            loading: data.loading,
            hma: data.hma,
            certificate: data.certificate,
            requirements: data.requirements || '',
            customer_comments: data.comments || '',
            created_at: data.timestamp || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted: false
          });
          
        if (insertError) {
          setError('Failed to save offer data');
          onError?.('Failed to save offer data');
          return false;
        }
      }
      
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