import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import OfferForm from '../components/forms/OfferForm';

interface Customer {
  id: string;
  company_name: string;
  email?: string;
  telephone?: string;
}

interface ValidationData {
  isValid: boolean;
  customer: Customer;
  error?: string;
}

const FormPage: React.FC = () => {
  const { token } = useParams<Record<string, string>>();
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Check if the token is valid and not used
        const { data: formLink, error: formLinkError } = await supabase
          .from('form_links')
          .select('*, customer:customers(*)')
          .eq('token', token)
          .eq('is_used', false)
          .single();

        if (formLinkError) {
          throw new Error('Invalid or expired token');
        }

        if (!formLink) {
          throw new Error('Form link not found');
        }

        // Validate that the link is not expired
        const expiryDate = new Date(formLink.expires_at);
        if (expiryDate < new Date()) {
          throw new Error('Form link has expired');
        }

        setValidationData({
          isValid: true,
          customer: formLink.customer as Customer,
        });

      } catch (err) {
        console.error('Token validation error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setValidationData({
          isValid: false,
          customer: {} as Customer,
          error: err instanceof Error ? err.message : 'An error occurred',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setError('No token provided');
      setIsLoading(false);
    }
  }, [token]);

  const handleFormSubmit = async (data: any) => {
    try {
      // Format the data for submission
      const offerData = {
        customer_id: validationData?.customer.id,
        source: 'Form',
        // Combine various data into customer_comments
        customer_comments: JSON.stringify({
          address: data.customerDetails.address,
          postalCode: data.customerDetails.postalCode,
          town: data.customerDetails.town,
          wasteType: data.wasteDetails.wasteType,
          whoTransport: data.wasteDetails.whoTransport,
          loading: data.wasteDetails.loading,
          hma: data.finalDetails.hma,
          certificate: data.finalDetails.certificate,
        }),
        status: 'submitted',
      };
      
      // Submit the offer to the database
      const { error } = await supabase
        .from('offers')
        .insert({
          customer_id: offerData.customer_id,
          source: offerData.source,
          customer_comments: offerData.customer_comments,
          status: offerData.status,
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Mark the form link as used
      await supabase
        .from('form_links')
        .update({ is_used: true })
        .eq('token', token);
        
      return { success: true };
      
    } catch (error) {
      console.error('Submission error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !validationData?.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Form Link</h1>
          <p className="text-gray-600 mb-6">{error || validationData?.error || 'This form link is invalid or has expired.'}</p>
          <a href="/" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {validationData && (
          <OfferForm 
            customerName={validationData.customer.company_name}
            onFormSubmit={handleFormSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default FormPage;