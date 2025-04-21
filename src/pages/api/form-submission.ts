import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import emailConfig from '../../lib/config/emailConfig';

const resend = new Resend(emailConfig.apiKey);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerName, customerEmail, formData } = req.body;
    
    if (!customerName || !customerEmail || !formData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Sending email notification for:', customerName);

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

    const { data, error } = await resend.emails.send({
      from: `${emailConfig.senderName} <${emailConfig.senderEmail}>`,
      to: emailConfig.notificationRecipients,
      subject: `${emailConfig.subjects.formSubmission}: ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #52796f; border-bottom: 2px solid #52796f; padding-bottom: 10px;">Νέα Υποβολή Φόρμας</h1>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Στοιχεία Πελάτη</h2>
            <p><strong>Όνομα:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Ημερομηνία Υποβολής:</strong> ${new Date().toLocaleString('el-GR')}</p>
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

    if (error) {
      console.error('Email sending error:', error);
      return res.status(400).json(error);
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error in API route:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}; 