import { supabase } from '../../lib/supabaseClient';
import { ValidationResult } from '../../types/validation';

// Helper function to format date in Greek full format
const formatGreekDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
  const months = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 
                  'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];
                  
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${dayOfMonth} ${month} ${year} και ώρα ${hours}:${minutes}`;
};

export const FormValidationService = {
  /**
   * Validate a form link token
   * @param token Form link token from URL
   * @returns Validation result with customer information
   */
  async validateFormToken(token: string): Promise<ValidationResult> {
    try {
      // Check for empty or undefined token
      if (!token) {
        return {
          isValid: false,
          error: 'Missing token'
        };
      }
      
      // Extract token from possible query parameters format
      const cleanToken = token.split('?')[0];
      
      // Skip logging for obviously invalid tokens to reduce console noise
      const isLikelyValid = cleanToken && cleanToken.length > 10 && /^[A-Za-z0-9]+$/.test(cleanToken);
      
      if (isLikelyValid) {
        console.log('Processing token validation:', { 
          originalToken: token, 
          cleanToken 
        });
      }
      
      // Validate token format (should be alphanumeric)
      if (!cleanToken || !/^[A-Za-z0-9]+$/.test(cleanToken)) {
        // Don't log this as an error for obvious invalid tokens
        return {
          isValid: false,
          error: 'Invalid token format'
        };
      }
      
      // Query the form link from database
      const { data: formLink, error } = await supabase
        .from('customer_form_links')
        .select('*')
        .eq('token', cleanToken)
        .eq('is_deleted', false)
        .single();
      
      if (error || !formLink) {
        // Only log as error if this seems like it should have been a valid token
        if (isLikelyValid) {
          console.log('Form link not found for token:', cleanToken);
        }
        return {
          isValid: false,
          error: 'Invalid form link or link not found'
        };
      }
      
      // Check if the form link has expired
      if (new Date(formLink.expires_at) < new Date()) {
        console.log('Form link expired:', formLink.expires_at);
        const formattedDate = formatGreekDate(formLink.expires_at);
        return {
          isValid: false,
          error: `Αυτός ο σύνδεσμος έχει λήξει στις ${formattedDate}.`,
          expiredAt: formLink.expires_at
        };
      }
      
      // Check if the form has already been used
      if (formLink.is_used) {
        console.log('Form link already used:', formLink.token);
        
        // Format submission date if available, otherwise use updated date
        const submissionDate = formLink.submitted_at || formLink.updated_at;
        const formattedDate = formatGreekDate(submissionDate);
        
        return {
          isValid: false,
          error: `Αυτή η φόρμα έχει ήδη υποβληθεί στις ${formattedDate}.`,
          submittedAt: submissionDate,
          customerId: formLink.customer_id
        };
      }
      
      // Get customer information
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id, company_name')
        .eq('id', formLink.customer_id)
        .single();
      
      if (customerError || !customer) {
        console.error('Customer not found:', customerError);
        return {
          isValid: false,
          error: 'Customer information not found'
        };
      }
      
      // Log successful validation
      console.log('Form token validated successfully:', {
        customerId: customer.id,
        customerName: customer.company_name
      });
      
      return {
        isValid: true,
        customerId: customer.id,
        customerName: customer.company_name
      };
    } catch (error) {
      console.error('Error validating form token:', error);
      return {
        isValid: false,
        error: 'An unexpected error occurred during validation'
      };
    }
  }
}; 