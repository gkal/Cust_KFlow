/**
 * Email Configuration
 * 
 * This file contains configuration settings for the EmailJS service.
 */

// Safely access environment variables that might not be defined in the browser
const getEnvVariable = (key: string, fallback: string): string => {
  // Check if we're running on the client side (where process.env might not be available)
  if (typeof window !== 'undefined') {
    // For client-side, we need to access only client-accessible env vars
    // @ts-ignore - Accessing window.__NEXT_DATA__.props.pageProps.env which might be set during SSR
    return (window.__NEXT_DATA__?.props?.pageProps?.env?.[key]) || fallback;
  }
  
  // For server-side, we can access process.env directly
  return (typeof process !== 'undefined' && process.env && process.env[key]) || fallback;
};

// Parse notification recipients from comma-separated list in env var
const getNotificationRecipients = (): string[] => {
  const recipients = getEnvVariable('NOTIFICATION_RECIPIENTS', 'gkaloforidis@yahoo.com');
  return recipients.split(',').map(email => email.trim());
};

export const emailConfig = {
  // Email addresses
  senderEmail: getEnvVariable('SENDER_EMAIL', 'noreply@cse.gr'),
  senderName: getEnvVariable('SENDER_NAME', 'Kronos Form Submission System'),
  notificationRecipients: getNotificationRecipients(),
  
  // SMTP Configuration
  smtpHost: getEnvVariable('SMTP_HOST', 'smtp.example.com'),
  smtpPort: parseInt(getEnvVariable('SMTP_PORT', '587')),
  smtpSecure: getEnvVariable('SMTP_SECURE', 'false') === 'true',
  smtpUser: getEnvVariable('SMTP_USER', 'user@example.com'),
  smtpPassword: getEnvVariable('SMTP_PASSWORD', 'password'),
  
  // Email subjects
  subjects: {
    formSubmission: 'Πραγματοποιήθηκε Αποστολή Φόρμας από πελάτη',
    notFound: 'Σελίδα Δεν Βρέθηκε'
  }
};

export default emailConfig; 