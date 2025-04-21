import { supabase } from '../../lib/supabaseClient';
import { FormLinkStatus } from '../../types/validation';

export const FormLinkService = {
  /**
   * Update form link status
   * @param token Form link token
   * @param status New status (pending, submitted)
   * @returns Success status and error message if any
   */
  async updateFormLinkStatus(
    token: string, 
    status: FormLinkStatus['status']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Clean the token if it contains any query parameters
      const cleanToken = token.split('?')[0];
      
      // First check if the link exists and what its current state is
      const { data: existingLink, error: fetchError } = await supabase
        .from('customer_form_links')
        .select('*')
        .eq('token', cleanToken)
        .single();
      
      if (fetchError) {
        console.error('Error fetching form link before update:', fetchError);
        return {
          success: false,
          error: 'Failed to find form link'
        };
      }
      
      console.log('Current form link state before update:', existingLink);
      
      // Prepare update data based on status - only include fields that exist in the database
      const updateData: Record<string, any> = {
        status,
        updated_at: new Date().toISOString()
      };
      
      // For submissions, mark as used and set submitted_at timestamp
      if (status === 'submitted') {
        updateData.is_used = true;
        updateData.submitted_at = new Date().toISOString();
      }
      
      console.log('Updating form link status:', { token: cleanToken, status, updateData });
      
      const { data: updatedLink, error } = await supabase
        .from('customer_form_links')
        .update(updateData)
        .eq('token', cleanToken)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating form link status:', error);
        return {
          success: false,
          error: 'Failed to update form status'
        };
      }
      
      console.log('Form link updated successfully:', updatedLink);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating form link status:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while updating form status'
      };
    }
  }
}; 