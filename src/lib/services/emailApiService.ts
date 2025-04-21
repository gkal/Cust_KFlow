import emailjs from '@emailjs/browser';
import { emailConfig } from '../config/emailConfig';

// Interface for form submission data
interface FormSubmissionData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  formData: Record<string, any>; // All form fields
  timestamp: Date;
}

// Interface for expired link data
interface ExpiredLinkData {
  customerId?: string;
  customerName?: string;
  expiredAt: string;
  currentTime: Date;
  token: string;
}

// Safely access environment variables
const getEnvVariable = (key: string, fallback: string): string => {
  if (typeof window !== 'undefined') {
    // For client-side, we need to access only client-accessible env vars
    // @ts-ignore - Accessing window.__NEXT_DATA__.props.pageProps.env which might be set during SSR
    return (window.__NEXT_DATA__?.props?.pageProps?.env?.[key]) || fallback;
  }
  
  // For server-side, we can access process.env directly
  return (typeof process !== 'undefined' && process.env && process.env[key]) || fallback;
};

/**
 * Email service using EmailJS
 * Configuration is now pulled from environment variables with fallbacks
 */
const EMAILJS_CONFIG = {
  SERVICE_ID: getEnvVariable('EMAILJS_SERVICE_ID', 'service_efhbrso'),
  FORM_TEMPLATE_ID: getEnvVariable('EMAILJS_FORM_TEMPLATE_ID', 'template_75kx2bl'),
  USER_ID: getEnvVariable('EMAILJS_USER_ID', 'CYQJ2J9mRsFlnVwN2'),
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.USER_ID);

// Helper function to format date in full Greek format
function formatGreekFullDate(date: Date): string {
  // Greek day names
  const greekDays = [
    'Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'
  ];
  
  // Greek month names in genitive case
  const greekMonths = [
    'Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου',
    'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'
  ];
  
  const dayName = greekDays[date.getDay()];
  const day = date.getDate();
  const month = greekMonths[date.getMonth()];
  const year = date.getFullYear();
  
  // Format time
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const timeOfDay = hours >= 12 ? 'μ.μ.' : 'π.μ.';
  
  // Format with leading zeros for minutes and seconds
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
  
  // Format hour for 12-hour clock
  const hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  
  return `${dayName}, ${day} ${month} ${year}, ${hour12}:${formattedMinutes}:${formattedSeconds} ${timeOfDay}`;
}

/**
 * Send form submission notification
 */
export const sendFormSubmissionNotification = async (data: FormSubmissionData) => {
  try {
    // Get the notification recipients, with fallback if emailConfig is undefined or empty
    let recipients = 'gkaloforidis@yahoo.com';
    try {
      if (emailConfig && emailConfig.notificationRecipients && emailConfig.notificationRecipients.length > 0) {
        recipients = emailConfig.notificationRecipients.join(',');
      }
    } catch (e) {
      // Use fallback recipient
    }
    
    // Create the exact message format requested by the customer
    const fullMessage = `
Σύνοψη Προσφοράς
Πελάτης: ${data.customerName}
Διεύθυνση: ${data.formData.address || ''}, ${data.formData.city || ''} ${data.formData.postalCode || ''}
Τύπος Αποβλήτου: ${data.formData.wasteType || ''}
Μεταφορά από: ${data.formData.whoTransports === false ? 'Πελάτη' : 'Kronos'}
Φόρτωση: ${data.formData.loading || ''}
ΗΜΑ: ${data.formData.hma === true ? 'Ναι' : 'Όχι'}
Βεβαίωση: ${data.formData.certificate || ''}
Πηγή: ${data.formData.source || 'Email'}
Ημερομηνία/Ώρα Υποβολής: ${formatGreekFullDate(data.timestamp)}
    `;
    
    // Prepare template parameters
    const templateParams = {
      to_name: 'Administrator',
      to_email: recipients,
      from_name: emailConfig.senderName,
      title: `${emailConfig.subjects.formSubmission} - ${data.customerName}`,
      customer_name: data.customerName,
      customer_email: data.customerEmail || '',
      customer_phone: data.customerPhone || '',
      submission_time: data.timestamp.toLocaleString('el-GR'),
      message: fullMessage
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.FORM_TEMPLATE_ID,
      templateParams
    );
    
    return { 
      messageId: `emailjs-${Date.now()}`, 
      success: true,
      response
    };
  } catch (error) {
    // Return a fallback response so the app doesn't break
    return { 
      messageId: `mock-fallback-${Date.now()}`, 
      success: false,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Send notification when a user attempts to access an expired link
 */
export const sendExpiredLinkNotification = async (data: ExpiredLinkData) => {
  try {
    // Get the notification recipients, with fallback if emailConfig is undefined or empty
    let recipients = 'gkaloforidis@yahoo.com';
    try {
      if (emailConfig && emailConfig.notificationRecipients && emailConfig.notificationRecipients.length > 0) {
        recipients = emailConfig.notificationRecipients.join(',');
      }
    } catch (e) {
      // Use fallback recipient
    }
    
    // Create the message for expired link notification
    const expiredDate = new Date(data.expiredAt);
    const fullMessage = `
Προσπάθεια χρήσης ληγμένου συνδέσμου

Πελάτης: ${data.customerName || 'Μη διαθέσιμο'}
ID Πελάτη: ${data.customerId || 'Μη διαθέσιμο'}
Token Συνδέσμου: ${data.token}

Ο σύνδεσμος έληξε στις: ${formatGreekFullDate(expiredDate)}
Η προσπάθεια χρήσης έγινε στις: ${formatGreekFullDate(data.currentTime)}

Ο πελάτης προσπάθησε να χρησιμοποιήσει τον σύνδεσμο μετά τη λήξη του.
Ίσως θα θέλατε να επικοινωνήσετε μαζί του για να δημιουργήσετε έναν νέο σύνδεσμο.
    `;
    
    // Prepare template parameters
    const templateParams = {
      to_name: 'Administrator',
      to_email: recipients,
      from_name: emailConfig.senderName,
      title: `${emailConfig.subjects.expiredLink}${data.customerName ? ' - ' + data.customerName : ''}`,
      customer_name: data.customerName || 'Μη διαθέσιμο',
      customer_email: '',
      customer_phone: '',
      submission_time: data.currentTime.toLocaleString('el-GR'),
      message: fullMessage
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.FORM_TEMPLATE_ID,
      templateParams
    );
    
    return { 
      messageId: `emailjs-${Date.now()}`, 
      success: true,
      response
    };
  } catch (error) {
    // Return a fallback response so the app doesn't break
    return { 
      messageId: `mock-fallback-${Date.now()}`, 
      success: false,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export default {
  sendFormSubmissionNotification,
  sendExpiredLinkNotification
}; 