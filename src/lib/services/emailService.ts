import { Resend } from 'resend';
import emailConfig from '../config/emailConfig';

// Initialize the Resend client with your API key
const resend = new Resend(emailConfig.apiKey);

// Debug logging function
const logDebug = (message: string, data?: any) => {
  console.log(`[EmailService] ${message}`, data ? data : '');
};

// Error logging function
const logError = (message: string, error: any) => {
  console.error(`[EmailService ERROR] ${message}`, error);
  // Log specific API key issues (without exposing the full key)
  if (emailConfig.apiKey) {
    const maskedKey = emailConfig.apiKey.substring(0, 5) + '...' + emailConfig.apiKey.substring(emailConfig.apiKey.length - 5);
    console.log(`[EmailService] Using API key: ${maskedKey}`);
  } else {
    console.error('[EmailService] No API key provided');
  }
};

// Interface for the notification email data
interface NotFound404NotificationData {
  pageUrl: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
  ipAddress?: string;
}

// Interface for form submission data
interface FormSubmissionData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  formData: Record<string, any>; // All form fields
  timestamp: Date;
}

/**
 * Send notification email when a customer submits a form
 * @param data Customer form submission data
 * @returns Promise with the result of the email sending operation
 */
export const sendFormSubmissionNotification = async (data: FormSubmissionData) => {
  try {
    logDebug('Preparing to send form submission notification');
    const { customerName, customerEmail, customerPhone, formData, timestamp } = data;
    
    // Format the date for better readability
    const formattedDate = timestamp.toLocaleString('el-GR', { 
      timeZone: 'Europe/Athens',
      dateStyle: 'full', 
      timeStyle: 'long' 
    });
    
    logDebug('Generating HTML for form fields');
    // Generate HTML for form fields
    const formFieldsHtml = Object.entries(formData)
      .map(([key, value]) => {
        // Format arrays and objects for better readability
        let displayValue = value;
        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
          displayValue = JSON.stringify(value, null, 2);
        }
        
        return `<tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${key}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${displayValue}</td>
        </tr>`;
      })
      .join('');
    
    const emailSubject = `${emailConfig.subjects.formSubmission}: ${customerName}`;
    logDebug(`Sending email with subject: ${emailSubject}`);
    logDebug(`Sending to recipients: ${emailConfig.notificationRecipients.join(', ')}`);
    
    const result = await resend.emails.send({
      from: `${emailConfig.senderName} <${emailConfig.senderEmail}>`,
      to: emailConfig.notificationRecipients,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #52796f; border-bottom: 2px solid #52796f; padding-bottom: 10px;">Νέα Υποβολή Φόρμας</h1>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Στοιχεία Πελάτη</h2>
            <p><strong>Όνομα:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            ${customerPhone ? `<p><strong>Τηλέφωνο:</strong> ${customerPhone}</p>` : ''}
            <p><strong>Ημερομηνία Υποβολής:</strong> ${formattedDate}</p>
          </div>
          
          <h2 style="color: #333;">Δεδομένα Φόρμας</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #52796f; color: white;">
                <th style="padding: 10px; text-align: left;">Πεδίο</th>
                <th style="padding: 10px; text-align: left;">Τιμή</th>
              </tr>
            </thead>
            <tbody>
              ${formFieldsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666;">
            <p>Αυτό είναι ένα αυτόματο email από το σύστημα της ιστοσελίδας Kronos.</p>
          </div>
        </div>
      `,
    });
    
    logDebug('Email sent successfully', result);
    return result;
  } catch (error) {
    logError('Failed to send form submission notification email', error);
    throw error;
  }
};

/**
 * Send a notification email to headquarters when a 404 error occurs
 * @param data Information about the 404 error
 * @returns Promise with the result of the email sending operation
 */
export const send404Notification = async (data: NotFound404NotificationData) => {
  try {
    logDebug('Preparing to send 404 notification');
    const { pageUrl, userAgent, referrer, timestamp, ipAddress } = data;
    
    // Format the date for better readability
    const formattedDate = timestamp.toLocaleString('el-GR', { 
      timeZone: 'Europe/Athens',
      dateStyle: 'full', 
      timeStyle: 'long' 
    });
    
    const result = await resend.emails.send({
      from: `${emailConfig.senderName} <${emailConfig.senderEmail}>`,
      to: emailConfig.notificationRecipients,
      subject: `${emailConfig.subjects.notFound} - ${pageUrl}`,
      html: `
        <h1>404 Page Not Found Notification</h1>
        <p>Someone attempted to access a page that doesn't exist on your website.</p>
        
        <h2>Details:</h2>
        <ul>
          <li><strong>Page URL:</strong> ${pageUrl}</li>
          <li><strong>Time:</strong> ${formattedDate}</li>
          ${userAgent ? `<li><strong>Browser/Device:</strong> ${userAgent}</li>` : ''}
          ${referrer ? `<li><strong>Referred from:</strong> ${referrer}</li>` : ''}
          ${ipAddress ? `<li><strong>IP Address:</strong> ${ipAddress}</li>` : ''}
        </ul>
        
        <p>You may want to consider creating this page or setting up a redirect if this URL is important.</p>
        
        <p>This is an automated notification from your Kronos website.</p>
      `,
    });
    
    logDebug('404 notification email sent successfully', result);
    return result;
  } catch (error) {
    logError('Failed to send 404 notification email', error);
    throw error;
  }
};

/**
 * This is a utility function that can be used to test the email service
 */
export const testEmailService = async () => {
  try {
    logDebug('Testing email service');
    logDebug(`API Key available: ${!!emailConfig.apiKey}`);
    logDebug(`Recipients: ${emailConfig.notificationRecipients.join(', ')}`);
    
    const result = await resend.emails.send({
      from: `${emailConfig.senderName} <${emailConfig.senderEmail}>`,
      to: emailConfig.notificationRecipients,
      subject: emailConfig.subjects.test,
      html: '<h1>Email Service Test</h1><p>This is a test email to confirm that the email service is working correctly.</p>',
    });
    
    logDebug('Test email sent successfully', result);
    return result;
  } catch (error) {
    logError('Failed to send test email', error);
    throw error;
  }
};

export default {
  send404Notification,
  sendFormSubmissionNotification,
  testEmailService
}; 