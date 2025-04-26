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
        return {
          isValid: false,
          error: 'Invalid form link or link not found'
        };
      }
      
      // Get customer information (moved here to retrieve for all cases including expired links)
      const { data: customer } = await supabase
        .from('customers')
        .select('id, company_name')
        .eq('id', formLink.customer_id)
        .single();
      
      const customerName = customer?.company_name || null;
      
      // Check if the form link has expired
      if (new Date(formLink.expires_at) < new Date()) {
        const formattedDate = formatGreekDate(formLink.expires_at);
        return {
          isValid: false,
          error: `Αυτός ο σύνδεσμος έχει λήξει στις ${formattedDate}.`,
          expiredAt: formLink.expires_at,
          customerId: formLink.customer_id,
          customerName: customerName // Include customer name for expired links
        };
      }
      
      // Check if the form has already been used
      if (formLink.is_used) {
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
      
      // Success case: valid link
      return {
        isValid: true,
        customerId: customer?.id,
        customerName: customerName
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'An unexpected error occurred during validation'
      };
    }
  }
}; 