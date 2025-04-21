import React, { useState, useEffect } from 'react';
import { Stepper } from '../components/ui/Stepper';
import { supabase, getUserId } from '../lib/supabaseClient';
import { z } from 'zod';
import { useFormContext } from '../lib/hooks/useFormContext';
import { emailConfig } from '../lib/config/emailConfig';

// Import only necessary styles
import '../styles/index.css';

// Define Zod schema for form validation
const formSchema = z.object({
  // Hidden values
  customerName: z.string(),
  customerEmail: z.string(),
  source: z.string(),
  
  // Step 1 - Customer address
  address: z.string().min(1, "Η διεύθυνση είναι υποχρεωτική"),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  
  // Step 2 - Waste details
  wasteType: z.string().min(1, "Ο τύπος αποβλήτου είναι υποχρεωτικός"),
  whoTransports: z.boolean(),
  
  // Step 3 - Loading details
  loading: z.string().min(1, "Οι λεπτομέρειες φόρτωσης είναι υποχρεωτικές"),
  hma: z.boolean(),
  certificate: z.string().optional()
});

// Define submission schema that matches Supabase database
type OfferInput = {
  customer_id: string;
  source: string;
  created_by: string;
  waste_type: string;
  address: string;
  tk?: string;
  town?: string;
  who_transport: boolean;
  loading: string;
  hma: boolean;
  certificate?: string;
  requirements: string;
  customer_comments: string;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

const submissionSchema = z.object({
  customer_id: z.string().uuid(),
  source: z.enum(['Email', 'Phone', 'Site', 'Physical']),
  created_by: z.string().uuid(),
  waste_type: z.string(),
  address: z.string(),
  tk: z.string().optional(),
  town: z.string().optional(),
  who_transport: z.boolean(),
  loading: z.string(),
  hma: z.boolean(),
  certificate: z.string().optional(),
  requirements: z.string(),
  customer_comments: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted: z.boolean()
});

// Type inference
type FormData = z.infer<typeof formSchema>;
export type SubmissionData = z.infer<typeof submissionSchema>;

export default function StepperForm() {
  const { customerId, customerName, submitForm } = useFormContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [dialogState, setDialogState] = useState<{
    show: boolean;
    title: string;
    message: string;
    isError: boolean;
  }>({
    show: false,
    title: '',
    message: '',
    isError: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Use effect to manage browser history state
  useEffect(() => {
    // Check if there was a previous submission in this session
    const hasSubmitted = sessionStorage.getItem('form_submitted');
    if (hasSubmitted === 'true') {
      setFormSubmitted(true);
    } else {
      // Clear the submitted flag to ensure a fresh form on new token
      setFormSubmitted(false);
      // Also ensure it's cleared in session storage
      sessionStorage.removeItem('form_submitted');
    }
    
    // Add event listener for page navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting) {
        // Prevent accidental navigation during submission
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    // Add event listener for browser back button
    const handlePopState = () => {
      if (sessionStorage.getItem('form_submitted') === 'true') {
        // If form was already submitted and user tries to go back, 
        // prevent them from seeing the form again
        setFormSubmitted(true);
      }
    };
    
    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Push an initial state to the history stack
    if (!formSubmitted) {
      window.history.pushState({ formStep: 'initial' }, '');
    }
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [formSubmitted, isSubmitting]);
  
  // Watch for token/customerId changes to reset form state for new customers
  useEffect(() => {
    // Reset form submission status when a new customer token is detected
    if (customerId) {
      console.log('New customer detected, resetting form state:', customerId);
      setFormSubmitted(false);
      sessionStorage.removeItem('form_submitted');
    }
  }, [customerId]);
  
  // Customer data state with default values
  const [formData, setFormData] = useState<FormData>({
    // Hidden values
    customerName: customerName || "",
    customerEmail: "",
    source: "Email",
    
    // Step 1 - Customer address
    address: "",
    postalCode: "",
    city: "",
    
    // Step 2 - Waste details
    wasteType: "",
    whoTransports: true, // true = Kronos, false = customer (Default is now Kronos)
    
    // Step 3 - Loading details
    loading: "",
    hma: false, // toggle for HMA
    certificate: "" // certificate number
  });
  
  // Reset form after successful submission
  const resetForm = () => {
    setCurrentStep(0);
    setFormData({
      customerName: customerName || "",
      customerEmail: "",
      source: "Email",
      address: "",
      postalCode: "",
      city: "",
      wasteType: "",
      whoTransports: true, // Default to Kronos
      loading: "",
      hma: false,
      certificate: ""
    });
    setValidationErrors({});
    setIsSubmitting(false);
    setFormSubmitted(true);
    setAgreementChecked(false);
    
    // Mark as submitted in session storage
    sessionStorage.setItem('form_submitted', 'true');
    
    // Push a new state to prevent going back to form
    window.history.pushState({ formSubmitted: true }, '', window.location.pathname);
  };
  
  // Handle dialog close
  const closeDialog = () => {
    setDialogState({ ...dialogState, show: false });
    if (!dialogState.isError && formSubmitted) {
      // For standalone example, just reset the form
      resetForm();
    }
  };

  // Show custom dialog
  const showDialog = (title: string, message: string, isError: boolean = false) => {
    setDialogState({
      show: true,
      title,
      message,
      isError
    });
  };
  
  // Create a new offer
  // @ts-ignore: Preserved for future functionality
  const startNewOffer = () => {
    // Clear submission state in session storage
    sessionStorage.removeItem('form_submitted');
    
    // Reset form
    setFormSubmitted(false);
    setCurrentStep(0);
    setFormData({
      customerName: customerName || "",
      customerEmail: "",
      source: "Email",
      address: "",
      postalCode: "",
      city: "",
      wasteType: "",
      whoTransports: true,
      loading: "",
      hma: false,
      certificate: ""
    });
    setValidationErrors({});
    
    // Replace the current state to prevent going back to thank you page
    window.history.replaceState({ formStep: 'new' }, '', window.location.pathname);
  };
  
  // Update form data with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Update toggle switches
  const handleToggleChange = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
  };
  
  // Handle agreement checkbox
  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreementChecked(e.target.checked);
  };
  
  const steps = ['Στοιχεία Διεύθυνσης', 'Τύπος Αποβλήτου', 'Στοιχεία Φόρτωσης', 'Προεπισκόπηση'];

  // Validate the current step before proceeding
  const validateCurrentStep = (): boolean => {
    try {
      if (currentStep === 0) {
        if (!formData.address.trim()) {
          setValidationErrors({
            address: "Το πεδίο Διεύθυνση είναι υποχρεωτικό. Παρακαλώ συμπληρώστε το για να συνεχίσετε."
          });
          return false;
        }
        formSchema.pick({ address: true }).parse(formData);
        return true;
      } else if (currentStep === 1) {
        if (!formData.wasteType.trim()) {
          setValidationErrors({
            wasteType: "Το πεδίο Τύπος Αποβλήτου είναι υποχρεωτικό. Παρακαλώ συμπληρώστε το για να συνεχίσετε."
          });
          return false;
        }
        formSchema.pick({ wasteType: true }).parse(formData);
        return true;
      } else if (currentStep === 2) {
        if (!formData.loading.trim()) {
          setValidationErrors({
            loading: "Το πεδίο Φόρτωση είναι υποχρεωτικό. Παρακαλώ συμπληρώστε το για να συνεχίσετε."
          });
          return false;
        }
        formSchema.pick({ loading: true }).parse(formData);
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        console.error('Validation error:', error.errors);
        return false;
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate the entire form first
    try {
      formSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const field = err.path[0].toString();
          newErrors[field] = err.message;
        });
        setValidationErrors(newErrors);
        console.error('Validation errors:', newErrors);
        showDialog('Σφάλμα φόρμας', 'Παρακαλώ διορθώστε τα σφάλματα στη φόρμα πριν την υποβολή.', true);
        return;
      }
    }
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    console.log('Starting form submission process', { customerId });
    
    try {
      // TEMPORARILY DISABLED - Insert the data into the offers table
      /* 
      const { data, error } = await supabase
        .from('offers')
        .insert({
          customer_id: customerId || '',
          source: formData.source as 'Email' | 'Phone' | 'Site' | 'Physical',
          created_by: getUserId(),
          waste_type: formData.wasteType,
          address: formData.address,
          tk: formData.postalCode || undefined,
          town: formData.city || undefined,
          who_transport: formData.whoTransports,
          loading: formData.loading,
          hma: formData.hma,
          certificate: formData.certificate || undefined,
          requirements: '',
          customer_comments: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted: false
        })
        .select();
      
      if (error) {
        console.error('Error submitting form:', error);
        showDialog('Σφάλμα υποβολής', 'Υπήρξε σφάλμα κατά την υποβολή της φόρμας. Παρακαλώ δοκιμάστε ξανά.', true);
        setIsSubmitting(false);
        return;
      }
      */
      
      // Mock successful data insertion for testing
      const data = {
        id: '123',
        customer_id: customerId || '',
        created_at: new Date().toISOString()
      };
      console.log('Simulated successful data insertion:', data);
      
      // Mark the form link as submitted
      console.log('Data inserted successfully, now marking form as submitted');
      const submitResult = await submitForm('submitted');
      
      if (!submitResult) {
        console.error('Error updating form link status');
        showDialog('Προειδοποίηση', 'Η προσφορά καταχωρήθηκε, αλλά υπήρξε πρόβλημα στην ενημέρωση της κατάστασης του συνδέσμου.', true);
        // Continue since the form data was saved successfully
      } else {
        console.log('Form link status updated successfully to submitted');
      }
      
      console.log('Form submitted successfully:', data);
      showDialog('Επιτυχία!', 'Η φόρμα υποβλήθηκε επιτυχώς!', false);
      
      // Send email notification via proxy to avoid CORS issues
      try {
        console.log('Sending email notification via proxy');
        
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
        
        // Use fetch with the proxy instead of Resend SDK directly
        const emailResponse = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${emailConfig.senderName} <${emailConfig.senderEmail}>`,
            to: emailConfig.notificationRecipients,
            subject: `${emailConfig.subjects.formSubmission}: ${formData.customerName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #52796f; border-bottom: 2px solid #52796f; padding-bottom: 10px;">Νέα Υποβολή Φόρμας</h1>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h2 style="color: #333; margin-top: 0;">Στοιχεία Πελάτη</h2>
                  <p><strong>Όνομα:</strong> ${formData.customerName}</p>
                  <p><strong>Email:</strong> ${formData.customerEmail || 'not-provided@example.com'}</p>
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
            `
          })
        });
        
        if (emailResponse.ok) {
          const result = await emailResponse.json();
          console.log('Email notification sent successfully', result);
        } else {
          console.warn('Email notification failed with status:', emailResponse.status);
          // For debugging purposes
          try {
            const errorText = await emailResponse.text();
            console.warn('Email error response:', errorText);
          } catch (e) {
            console.warn('Could not read error response text');
          }
          console.warn('Email notification failed but form was submitted');
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't show error to user since the form was successfully submitted
      }
      
      // Mark form as submitted in session storage
      sessionStorage.setItem('form_submitted', 'true');
      
      // Push a new state to prevent going back to form
      window.history.pushState({ formSubmitted: true }, '', window.location.pathname);
      
      // Reset form to initial state
      resetForm();
    } catch (error) {
      console.error('Exception during form submission:', error);
      showDialog('Σφάλμα υποβολής', 'Υπήρξε σφάλμα κατά την υποβολή της φόρμας. Παρακαλώ δοκιμάστε ξανά.', true);
      setIsSubmitting(false);
    }
  };

// Simplified custom styles that only focus on what we need to change
const customStyles = `
  /* Essential original styles for the app */
  input, textarea, button, select {
    border: 1px solid #52796f !important;
    background-color: #354f52 !important;
    color: #cad2c5 !important;
  }
  
  /* Input placeholder color */
  ::placeholder {
    color: #a8c5b5 !important;
    opacity: 0.7 !important;
  }
  
  /* Override for green submit button text */
  button[style*="background-color: #22c55e"] {
    color: #000000 !important;
  }
  
  /* Direct ID selectors for maximum specificity */
  #form-header {
    color: #84a98c !important;
  }
  
  #summary-header {
    color: #84a98c !important;
  }
  
  /* Very specific selector for form headers */
  .stepper-form-container .space-y-6 > h2 {
    color: #84a98c !important; 
  }
  
  /* Summary header */
  .space-y-6 .bg-\\[\\#ffffff\\] > h3 {
    color: #84a98c !important;
  }
  
  /* One more attempt with attribute selectors */
  h2[style*="color: #84a98c"], h3[style*="color: #84a98c"] {
    color: #84a98c !important;
  }
  
  /* Fixed height for textareas to display 3 lines */
  .fixed-height-textarea {
    min-height: 110px !important;
    height: auto !important;
  }
`;

// Add this styling for the validation error messages to make them more noticeable
const errorStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)'
};

  // If form is submitted, show a thank you message with options
  if (formSubmitted) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 text-center stepper-form-container">
        <div className="flex justify-center mb-6 sm:mb-8">
          <img src="/assets/images/logo.png" alt="Λογότυπο Εταιρείας" className="h-10 sm:h-14" />
        </div>
        
        <div className="p-6 sm:p-8 bg-[#354f52] rounded-lg border border-[#52796f]">
          <h1 className="text-xl sm:text-2xl font-bold text-[#22c55e] mb-4">Η προσφορά υποβλήθηκε επιτυχώς!</h1>
          <p className="text-[#84a98c] text-base sm:text-lg">Σας ευχαριστούμε για την υποβολή της προσφοράς.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 stepper-form-container">
      {/* Inject custom CSS */}
      <style>{customStyles}</style>
      
      {/* Custom Dialog with direct color values */}
      {dialogState.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#354f52] rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full border border-[#52796f]">
            <h3 className={`text-lg sm:text-xl font-bold mb-4 ${dialogState.isError ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
              {dialogState.title}
            </h3>
            <p className="text-[#cad2c5] mb-6">
              {dialogState.message}
            </p>
            <div className="flex justify-end">
              <button 
                onClick={closeDialog}
                className="px-4 py-2 bg-[#22c55e] text-white rounded hover:bg-opacity-90 transition-colors"
              >
                {dialogState.isError ? 'Κλείσιμο' : 'Συνέχεια'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Logo */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <img src="/assets/images/logo.png" alt="Λογότυπο Εταιρείας" className="h-10 sm:h-14" />
      </div>
      
      <h1 className="text-xl sm:text-2xl text-center md:text-left text-[#111827] mb-2">
        Φόρμα Προσφοράς για: <span className="font-bold">{formData.customerName}</span>
      </h1>
      <p className="text-sm sm:text-base text-center md:text-left text-[#84a98c] mb-4 sm:mb-6">Συμπληρώστε τα στοιχεία για τη δημιουργία προσφοράς.</p>
      <div 
        className="border-t border-[#e5e7eb] mb-6 sm:mb-8" 
        id="horizontal-divider-top"
        style={{ borderColor: "#e5e7eb" }}
      ></div>
      
      {/* Mobile stepper - visible only on small screens */}
      <div className="md:hidden mb-6">
        <div className="flex justify-between items-center px-2">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center ${
                index === currentStep 
                  ? "text-[#84a98c]"
                  : index < currentStep 
                    ? "text-[#84a98c]" 
                    : "text-[#6b7280]"
              }`}
            >
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  index <= currentStep 
                    ? "bg-[#84a98c]"
                    : "bg-[#ffffff] border border-[#e5e7eb]"
                }`}
              >
                {index < currentStep && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{index + 1}</span>
            </div>
          ))}
          <div className="absolute left-2 right-2 h-[1px] bg-[#e5e7eb] -z-10" style={{ top: "calc(50% - 9px)" }}></div>
        </div>
        <div className="flex justify-between text-[10px] mt-1 px-1">
          {steps.map((_, index) => (
            <div 
              key={`text-${index}`} 
              className={`w-1/4 text-center ${
                index === currentStep 
                  ? "text-[#84a98c] font-bold"
                  : index < currentStep 
                    ? "text-[#84a98c]" 
                    : "text-[#6b7280]"
              }`}
            >
              {steps[index]}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 relative">
        {/* Vertical stepper - hidden on small screens */}
        <div className="hidden md:block md:w-1/4">
          <Stepper 
            steps={steps} 
            currentStep={currentStep}
          />
        </div>
        
        {/* Vertical divider line - hidden on small screens */}
        <div 
          className="hidden md:block absolute left-[23.2%] -top-8 h-[calc(100%+40px)] w-px border-[#e5e7eb]" 
          id="vertical-line"
          style={{ 
            backgroundColor: '#e5e7eb', 
            zIndex: '50',
            borderLeft: '1px solid #e5e7eb'
          }}
        ></div>
        
        {/* Content */}
        <div className="w-full md:w-3/4">
          <div className="p-3 sm:p-6">
            {/* Fixed height content area - shorter on mobile */}
            <div className="min-h-[320px] sm:min-h-[450px]">
              {/* Step 1 - Customer address details */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-lg sm:text-xl font-bold mt-0 mb-4 sm:mb-6">
                    <span style={{ color: '#84a98c', fontWeight: 'bold' }}>Στοιχεία Διεύθυνσης</span>
                  </div>
                  
                  <div>
                    <label className="block text-base font-normal mb-2 text-[#84a98c]">
                      Διεύθυνση <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="address"
                      className="form-input w-full p-3 rounded text-base bg-[#354f52] text-[#cad2c5]"
                      style={{border: '1px solid #52796f', boxShadow: 'none'}}
                      placeholder="Οδός και αριθμός"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3">
                      <label className="block text-base font-normal mb-2 text-[#84a98c]">ΤΚ</label>
                      <input 
                        type="text" 
                        name="postalCode"
                        className="form-input w-full p-3 rounded text-base bg-[#354f52] text-[#cad2c5]"
                        style={{border: '1px solid #52796f', boxShadow: 'none'}}
                        placeholder="Ταχ. Κώδικας"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="w-full sm:w-2/3">
                      <label className="block text-base font-normal mb-2 text-[#84a98c]">Πόλη</label>
                      <input 
                        type="text" 
                        name="city"
                        className="form-input w-full p-3 rounded text-base bg-[#354f52] text-[#cad2c5]"
                        style={{border: '1px solid #52796f', boxShadow: 'none'}}
                        placeholder="Πόλη"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  {validationErrors.address && (
                    <div className="mt-4 text-red-500 text-sm" style={errorStyle}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {validationErrors.address}
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 2 - Waste type and who transports */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-lg sm:text-xl font-bold mt-0 mb-4 sm:mb-6">
                    <span style={{ color: '#84a98c', fontWeight: 'bold' }}>Τύπος Αποβλήτου / Υπεύθυνος για την μεταφορά</span>
                  </div>
                  
                  <div>
                    <label className="block text-base font-normal mb-2 text-[#84a98c]">
                      Τύπος Αποβλήτου <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="wasteType"
                      className="form-input fixed-height-textarea w-full p-3 rounded text-base bg-[#354f52] text-[#cad2c5]"
                      style={{
                        border: '1px solid #52796f', 
                        boxShadow: 'none',
                        minHeight: '110px',
                        height: 'auto',
                        resize: 'none',
                        lineHeight: '1.5'
                      }}
                      placeholder="Περιγράψτε τον τύπο αποβλήτου..."
                      value={formData.wasteType}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <span className="font-normal text-base text-[#84a98c] mb-2 sm:mb-0 sm:mr-3">Ποιος μεταφέρει:</span>
                      <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto" style={{ maxWidth: '250px' }}>
                        <div className="w-20 text-base text-[#84a98c] font-medium">
                          {!formData.whoTransports ? 'Πελάτης' : ''}
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer mx-2">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={formData.whoTransports}
                            onChange={() => handleToggleChange('whoTransports')}
                          />
                          <div className="w-11 h-6 bg-[#354f52] border border-[#52796f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#cad2c5] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#cad2c5] after:border-[#52796f] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#52796f]"></div>
                        </label>
                        
                        <div className="w-20 text-base text-[#84a98c] font-medium">
                          {formData.whoTransports ? 'Κρόνος' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {validationErrors.wasteType && (
                    <div className="mt-4 text-red-500 text-sm" style={errorStyle}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {validationErrors.wasteType}
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 3 - Loading details, HMA and certificate */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-lg sm:text-xl font-bold mt-0 mb-4 sm:mb-6">
                    <span style={{ color: '#84a98c', fontWeight: 'bold' }}>Στοιχεία Φόρτωσης</span>
                  </div>
                  
                  <div>
                    <label className="block text-base font-normal mb-2 text-[#84a98c]">
                      Φόρτωση <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="loading"
                      className="form-input fixed-height-textarea w-full p-3 rounded text-base bg-[#354f52] text-[#cad2c5]"
                      style={{
                        border: '1px solid #52796f', 
                        boxShadow: 'none',
                        minHeight: '110px',
                        height: 'auto',
                        resize: 'none',
                        lineHeight: '1.5'
                      }}
                      placeholder="Περιγράψτε λεπτομέρειες φόρτωσης..."
                      value={formData.loading}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <span className="font-normal text-base text-[#84a98c] mb-2 sm:mb-0 sm:mr-3">ΗΜΑ:</span>
                      <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto" style={{ maxWidth: '200px' }}>
                        <div className="w-16 text-base text-[#84a98c] font-medium">
                          {!formData.hma ? 'Όχι' : ''}
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer mx-2">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={formData.hma}
                            onChange={() => handleToggleChange('hma')}
                          />
                          <div className="w-11 h-6 bg-[#354f52] border border-[#52796f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#cad2c5] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#cad2c5] after:border-[#52796f] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#52796f]"></div>
                        </label>
                        
                        <div className="w-16 text-base text-[#84a98c] font-medium">
                          {formData.hma ? 'Ναι' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-base font-normal mb-2 text-[#84a98c]">Βεβαίωση</label>
                    <input 
                      type="text" 
                      name="certificate"
                      className="form-input w-full p-3 rounded text-base bg-[#354f52] text-[#cad2c5]"
                      style={{border: '1px solid #52796f', boxShadow: 'none'}}
                      placeholder="Επιθυμητή Βεβαίωση: Ναι / Όχι / Άλλο"
                      value={formData.certificate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {validationErrors.loading && (
                    <div className="mt-4 text-red-500 text-sm" style={errorStyle}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {validationErrors.loading}
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 4 - Preview */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-lg sm:text-xl font-bold mt-0 mb-4 sm:mb-6">
                    <span style={{ color: '#84a98c', fontWeight: 'bold' }}>Προεπισκόπηση</span>
                  </div>
                  <p className="text-[#84a98c] text-base font-normal">Παρακαλώ επιβεβαιώστε τα στοιχεία πριν την υποβολή.</p>
                  
                  <div className="p-4 rounded bg-[#354f52]" style={{border: '1px solid #52796f'}}>
                    <div className="text-md font-bold mb-3">
                      <span style={{ color: '#84a98c', fontWeight: 'bold' }}>Σύνοψη Προσφοράς</span>
                    </div>
                    <div className="space-y-3 text-[#cad2c5] text-base">
                      <div>
                        <span className="font-normal text-[#84a98c]">Πελάτης:</span> {formData.customerName}
                      </div>
                      <div>
                        <span className="font-normal text-[#84a98c]">Διεύθυνση:</span> {formData.address || "-"}, {formData.postalCode || "-"} {formData.city || "-"}
                      </div>
                      <div>
                        <span className="font-normal text-[#84a98c]">Τύπος Αποβλήτου:</span> {formData.wasteType || "-"}
                      </div>
                      <div>
                        <span className="font-normal text-[#84a98c]">Μεταφορά από:</span> {formData.whoTransports ? 'Κρόνος' : 'Πελάτη'}
                      </div>
                      <div>
                        <span className="font-normal text-[#84a98c]">Φόρτωση:</span> {formData.loading || "-"}
                      </div>
                      <div>
                        <span className="font-normal text-[#84a98c]">ΗΜΑ:</span> {formData.hma ? 'Ναι' : 'Όχι'}
                      </div>
                      <div>
                        <span className="font-normal text-[#84a98c]">Βεβαίωση:</span> {formData.certificate || "-"}
                      </div>
                      <div>
                        <span className="font-normal text-[#84a98c]">Πηγή:</span> {formData.source}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded accent-[#22c55e]" 
                        checked={agreementChecked}
                        onChange={handleAgreementChange}
                      />
                      <span className="text-[#84a98c] text-base font-normal">Συμφωνώ με την υποβολή των παραπάνω στοιχείων</span>
                    </label>
                  </div>
                  
                  <div className="min-h-[40px] sm:min-h-[80px]"></div>
                </div>
              )}
            </div>
            
            {/* Custom horizontal line that connects to vertical line - adjust for mobile */}
            <div className="relative h-8 sm:h-12">
              {/* This element creates a combined effect to ensure perfect alignment - hide on mobile */}
              <div 
                className="absolute hidden md:block" 
                style={{ 
                  left: "-70px", 
                  top: "50%",
                  height: "0px",
                  width: "70px",
                  border: "none",
                  borderTop: "1px solid #52796f"
                }}
              ></div>
              <div 
                className="absolute" 
                style={{ 
                  left: "0", 
                  right: "-10px",
                  top: "50%",
                  height: "0px",
                  border: "none",
                  borderTop: "1px solid #52796f"
                }}
              ></div>
            </div>
            
            {/* Buttons for navigating between form steps */}
            <div className="flex justify-between mt-8">
              {/* Previous button - only show if not on first step */}
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-6 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  style={{
                    backgroundColor: "#354f52",
                    color: "#cad2c5",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                  }}
                >
                  Προηγούμενο
                </button>
              )}
              
              {/* Next/Submit button */}
              <button
                onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                disabled={
                  (currentStep === 0 && !formData.address) || 
                  (currentStep === 1 && !formData.wasteType) || 
                  (currentStep === 2 && !formData.loading) ||
                  (currentStep === steps.length - 1 && !agreementChecked)
                }
                className="px-6 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ml-auto"
                style={{
                  backgroundColor: "#22c55e",
                  color: "#000000",
                  opacity: (currentStep === 0 && !formData.address) || 
                          (currentStep === 1 && !formData.wasteType) || 
                          (currentStep === 2 && !formData.loading) ||
                          (currentStep === steps.length - 1 && !agreementChecked)
                            ? "0.5"
                            : "1",
                  cursor: (currentStep === 0 && !formData.address) || 
                          (currentStep === 1 && !formData.wasteType) || 
                          (currentStep === 2 && !formData.loading) ||
                          (currentStep === steps.length - 1 && !agreementChecked)
                            ? "not-allowed"
                            : "pointer",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Επεξεργασία...
                  </div>
                ) : currentStep === steps.length - 1 ? (
                  "Υποβολή"
                ) : (
                  "Επόμενο"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 