/**
 * Email Configuration
 * 
 * This file contains configuration settings for the email service.
 * In production, these values should be set using environment variables.
 */

// Safely access environment variables that might not be defined in the browser
const getEnvVariable = (key: string, fallback: string): string => {
  // Check if we're running on the client side (where process.env might not be available)
  if (typeof window !== 'undefined') {
    // For client-side, we need to access only NEXT_PUBLIC_ prefixed env vars
    // @ts-ignore - Accessing window.__NEXT_DATA__.props.pageProps.env which might be set during SSR
    return (window.__NEXT_DATA__?.props?.pageProps?.env?.[key]) || fallback;
  }
  
  // For server-side, we can access process.env directly
  return (typeof process !== 'undefined' && process.env && process.env[key]) || fallback;
};

export const emailConfig = {
  // Resend API key - replace with your actual key from https://resend.com/
  // In production, this should be set as NEXT_PUBLIC_RESEND_API_KEY in your environment
  apiKey: getEnvVariable('RESEND_API_KEY', 're_hf3QE3rC_PysybGnnKohDEd4c9z2uq5Ag'),
  
  // Email addresses
  senderEmail: 'noreply@kronoseco.gr',
  senderName: 'Kronos System',
  notificationRecipients: ['gkaloforidis@yahoo.com'], // Add multiple emails if needed
  
  // Email subjects
  subjects: {
    notFound: '404 Page Not Found Notification',
    formSubmission: 'Πραγματοποιήθηκε Αποστολή Φόρμας από πελάτη',
    test: 'Email Service Test'
  }
};

export default emailConfig; 