import React, { useState, useEffect } from 'react';
import { Stepper } from '../components/ui/Stepper';
import { supabase, getUserId, getTestCustomerId } from '../lib/supabaseClient';
import { z } from 'zod';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
  
  // Customer data state with default values
  const [formData, setFormData] = useState<FormData>({
    // Hidden values
    customerName: "aabbb", // Changed from "Όνομα Πελάτη" to actual customer name
    customerEmail: "", // Default source is email
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
      customerName: "aabbb",
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
      customerName: "aabbb",
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
  
  const steps = ['Στοιχεία Διεύθυνσης', 'Τύπος Αποβλήτου', 'Στοιχεία Φόρτωσης', 'Προεπισκόπηση'];

  // Validate the current step before proceeding
  const validateCurrentStep = (): boolean => {
    try {
      if (currentStep === 0) {
        // @ts-ignore: Variable is used for validation side effects
        formSchema.pick({ address: true }).parse(formData);
        return true;
      } else if (currentStep === 1) {
        // @ts-ignore: Variable is used for validation side effects
        formSchema.pick({ wasteType: true }).parse(formData);
        return true;
      } else if (currentStep === 2) {
        // @ts-ignore: Variable is used for validation side effects
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
    
    // Create the data object to be sent to the server with correct field mappings
    const submitData: OfferInput = {
      // Required fields
      customer_id: getTestCustomerId(), // Get valid customer ID for "aabbb"
      source: formData.source || 'Email',
      created_by: getUserId(), // Get the current user ID
      
      // Form data mapped to correct database fields
      waste_type: formData.wasteType,
      address: formData.address,
      tk: formData.postalCode, // Field is tk, not postal_code
      town: formData.city,
      who_transport: formData.whoTransports, // Field is who_transport (boolean)
      loading: formData.loading,
      hma: formData.hma,
      certificate: formData.certificate,
      
      // Metadata
      requirements: formData.wasteType, // For backward compatibility
      customer_comments: `Φόρτωση: ${formData.loading}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted: false
    };
    
    // Validate against submission schema
    try {
      submissionSchema.parse(submitData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Submission validation error:', error.errors);
        showDialog('Σφάλμα δεδομένων', 'Σφάλμα στη δομή των δεδομένων. Παρακαλώ επικοινωνήστε με τον διαχειριστή.', true);
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      // Insert the data directly into the offers table
      const { data, error } = await supabase
        .from('offers')
        .insert(submitData)
        .select();
      
      if (error) {
        console.error('Error submitting form:', error);
        showDialog('Σφάλμα υποβολής', 'Υπήρξε σφάλμα κατά την υποβολή της φόρμας. Παρακαλώ δοκιμάστε ξανά.', true);
        setIsSubmitting(false);
        return;
      }
      
      console.log('Form submitted successfully:', data);
      showDialog('Επιτυχία!', 'Η φόρμα υποβλήθηκε επιτυχώς!', false);
      
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

// Replace dynamic CSS variable styling with direct hardcoded values for reliability
const customStyles = `
  /* Target everything in this component with high specificity */
  #root div div div div div div div {
    color: #111827 !important;
  }
  
  /* Target specific elements that should be green */
  button, 
  [class*="success"],
  div:has(> div > svg[class*="check"]),
  div:has(> span:contains("Ναι")),
  div:has(> span:contains("Πελάτης")),
  div:has(> span:contains("Κρόνος")) {
    color: #22c55e !important;
  }
  
  /* Make backgrounds visible */
  [class*="bg-"] {
    background-color: #ffffff !important;
  }
  
  [class*="bg-"]:has(> h1),
  [class*="bg-"]:has(> h2),
  [class*="bg-"]:has(> h3) {
    background-color: #f3f4f6 !important;
  }
  
  /* Fix inputs */
  input, textarea, button, select {
    border: 1px solid #e5e7eb !important;
    background-color: #ffffff !important;
    color: #111827 !important;
  }
`;
  // If form is submitted, show a thank you message with options
  if (formSubmitted) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 text-center stepper-form-container">
        <div className="flex justify-center mb-6 sm:mb-8">
          <img src="/assets/images/logo.png" alt="Λογότυπο Εταιρείας" className="h-10 sm:h-14" />
        </div>
        
        <div className="p-6 sm:p-8 bg-[#f3f4f6] rounded-lg border border-[#e5e7eb]">
          <h1 className="text-xl sm:text-2xl font-bold text-[#22c55e] mb-4">Η προσφορά υποβλήθηκε επιτυχώς!</h1>
          <p className="text-[#111827] text-base sm:text-lg">Σας ευχαριστούμε για την υποβολή της προσφοράς.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 stepper-form-container">
      {/* Inject custom CSS */}
      <style>{customStyles}</style>
      
      {/* Custom Dialog with direct color values */}
      {dialogState.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className={`text-lg sm:text-xl font-bold mb-4 ${dialogState.isError ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
              {dialogState.title}
            </h3>
            <p className="text-[#111827] mb-6">
              {dialogState.message}
            </p>
            <div className="flex justify-end">
              <button 
                onClick={closeDialog}
                className="px-4 py-2 bg-[#22c55e] text-[#111827] rounded hover:bg-opacity-90 transition-colors"
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
      <p className="text-sm sm:text-base text-center md:text-left text-[#111827] mb-4 sm:mb-6">Συμπληρώστε τα στοιχεία για τη δημιουργία προσφοράς.</p>
      <div className="border-t border-[#e5e7eb] mb-6 sm:mb-8" id="horizontal-divider-top"></div>
      
      {/* Mobile stepper - visible only on small screens */}
      <div className="md:hidden mb-6">
        <div className="flex justify-between items-center px-2">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center ${
                index === currentStep 
                  ? "text-[#22c55e]" 
                  : index < currentStep 
                    ? "text-[#111827]" 
                    : "text-[#6b7280]"
              }`}
            >
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  index <= currentStep 
                    ? "bg-[#22c55e]" 
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
                  ? "text-[#22c55e] font-bold" 
                  : index < currentStep 
                    ? "text-[#111827]" 
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
        <div className="hidden md:block md:w-1/3">
          <Stepper 
            steps={steps} 
            currentStep={currentStep}
          />
        </div>
        
        {/* Vertical divider line - hidden on small screens */}
        <div className="hidden md:block absolute left-[28%] -top-8 h-[calc(100%+40px)] w-px bg-[#e5e7eb]" id="vertical-line"></div>
        
        {/* Content */}
        <div className="w-full md:w-2/3">
          <div className="p-3 sm:p-6">
            {/* Fixed height content area - shorter on mobile */}
            <div className="min-h-[320px] sm:min-h-[450px]">
              {/* Step 1 - Customer address details */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#111827] mt-0 mb-4 sm:mb-6">Στοιχεία Διεύθυνσης</h2>
                  
                  <div>
                    <label className="block text-base font-bold mb-2 text-[#111827]">
                      Διεύθυνση <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="address"
                      className="form-input w-full p-3 rounded text-base bg-[#ffffff] text-[#111827]"
                      style={{border: '1px solid #e5e7eb', boxShadow: 'none'}}
                      placeholder="Οδός και αριθμός"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3">
                      <label className="block text-base font-bold mb-2 text-[#111827]">ΤΚ</label>
                      <input 
                        type="text" 
                        name="postalCode"
                        className="form-input w-full p-3 rounded text-base bg-[#ffffff] text-[#111827]"
                        style={{border: '1px solid #e5e7eb', boxShadow: 'none'}}
                        placeholder="Ταχ. Κώδικας"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="w-full sm:w-2/3">
                      <label className="block text-base font-bold mb-2 text-[#111827]">Πόλη</label>
                      <input 
                        type="text" 
                        name="city"
                        className="form-input w-full p-3 rounded text-base bg-[#ffffff] text-[#111827]"
                        style={{border: '1px solid #e5e7eb', boxShadow: 'none'}}
                        placeholder="Πόλη"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  {validationErrors.address && (
                    <div className="mt-4 text-red-500 text-sm">* {validationErrors.address}</div>
                  )}
                </div>
              )}
              
              {/* Step 2 - Waste type and who transports */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#111827] mt-0 mb-4 sm:mb-6">Τύπος Αποβλήτου / Υπεύθυνος για την μεταφορά</h2>
                  
                  <div>
                    <label className="block text-base font-bold mb-2 text-[#111827]">
                      Τύπος Αποβλήτου <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="wasteType"
                      className="form-input fixed-height-textarea w-full p-3 rounded text-base bg-[#ffffff] text-[#111827]"
                      style={{border: '1px solid #e5e7eb', boxShadow: 'none'}}
                      placeholder="Περιγράψτε τον τύπο αποβλήτου..."
                      value={formData.wasteType}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <span className="font-bold text-base text-[#111827] mb-2 sm:mb-0 sm:mr-3">Ποιος μεταφέρει:</span>
                      <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto" style={{ maxWidth: '250px' }}>
                        <div className="w-20 text-base text-[#22c55e] font-medium">
                          {!formData.whoTransports ? 'Πελάτης' : ''}
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer mx-2">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={formData.whoTransports}
                            onChange={() => handleToggleChange('whoTransports')}
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
                        </label>
                        
                        <div className="w-20 text-base text-[#22c55e] font-medium">
                          {formData.whoTransports ? 'Κρόνος' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {validationErrors.wasteType && (
                    <div className="mt-4 text-red-500 text-sm">* {validationErrors.wasteType}</div>
                  )}
                </div>
              )}
              
              {/* Step 3 - Loading details, HMA and certificate */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#111827] mt-0 mb-4 sm:mb-6">Στοιχεία Φόρτωσης</h2>
                  
                  <div>
                    <label className="block text-base font-bold mb-2 text-[#111827]">
                      Φόρτωση <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="loading"
                      className="form-input fixed-height-textarea w-full p-3 rounded text-base bg-[#ffffff] text-[#111827]"
                      style={{border: '1px solid #e5e7eb', boxShadow: 'none'}}
                      placeholder="Περιγράψτε λεπτομέρειες φόρτωσης..."
                      value={formData.loading}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <span className="font-bold text-base text-[#111827] mb-2 sm:mb-0 sm:mr-3">ΗΜΑ:</span>
                      <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto" style={{ maxWidth: '200px' }}>
                        <div className="w-16 text-base text-[#22c55e] font-medium">
                          {!formData.hma ? 'Όχι' : ''}
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer mx-2">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={formData.hma}
                            onChange={() => handleToggleChange('hma')}
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
                        </label>
                        
                        <div className="w-16 text-base text-[#22c55e] font-medium">
                          {formData.hma ? 'Ναι' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-base font-bold mb-2 text-[#111827]">Βεβαίωση</label>
                    <input 
                      type="text" 
                      name="certificate"
                      className="form-input w-full p-3 rounded text-base bg-[#ffffff] text-[#111827]"
                      style={{border: '1px solid #e5e7eb', boxShadow: 'none'}}
                      placeholder="Επιθυμητή Βεβαίωση: Ναι / Όχι / Άλλο"
                      value={formData.certificate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {validationErrors.loading && (
                    <div className="mt-4 text-red-500 text-sm">* {validationErrors.loading}</div>
                  )}
                </div>
              )}
              
              {/* Step 4 - Preview */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#111827] mt-0 mb-4 sm:mb-6">Προεπισκόπηση</h2>
                  <p className="text-[#111827] text-base font-bold">Παρακαλώ επιβεβαιώστε τα στοιχεία πριν την υποβολή.</p>
                  
                  <div className="p-4 rounded bg-[#ffffff]" style={{border: '1px solid #e5e7eb'}}>
                    <h3 className="text-md font-bold text-[#111827] mb-3">Σύνοψη Προσφοράς</h3>
                    <div className="space-y-3 text-[#111827] text-base">
                      <div>
                        <span className="font-bold">Πελάτης:</span> {formData.customerName}
                      </div>
                      <div>
                        <span className="font-bold">Διεύθυνση:</span> {formData.address || "-"}, {formData.postalCode || "-"} {formData.city || "-"}
                      </div>
                      <div>
                        <span className="font-bold">Τύπος Αποβλήτου:</span> {formData.wasteType || "-"}
                      </div>
                      <div>
                        <span className="font-bold">Μεταφορά από:</span> {formData.whoTransports ? 'Κρόνος' : 'Πελάτη'}
                      </div>
                      <div>
                        <span className="font-bold">Φόρτωση:</span> {formData.loading || "-"}
                      </div>
                      <div>
                        <span className="font-bold">ΗΜΑ:</span> {formData.hma ? 'Ναι' : 'Όχι'}
                      </div>
                      <div>
                        <span className="font-bold">Βεβαίωση:</span> {formData.certificate || "-"}
                      </div>
                      <div>
                        <span className="font-bold">Πηγή:</span> {formData.source}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="h-5 w-5 rounded accent-[#22c55e]" />
                      <span className="text-[#111827] text-base font-bold">Συμφωνώ με την υποβολή των παραπάνω στοιχείων</span>
                    </label>
                  </div>
                  
                  <div className="min-h-[40px] sm:min-h-[80px]"></div>
                </div>
              )}
            </div>
            
            {/* Custom horizontal line that connects to vertical line - adjust for mobile */}
            <div className="relative h-8 sm:h-12">
              {/* This element creates a combined effect to ensure perfect alignment - hide on mobile */}
              <div className="absolute hidden md:block w-[102px] h-[1px] bg-[#e5e7eb]" style={{ left: "-102px", top: "50%" }}></div>
              <div className="absolute h-[1px] bg-[#e5e7eb]" style={{ 
                left: "0", 
                right: "-24px", /* Extend to match the top line */
                top: "50%" 
              }}></div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-3 py-2 sm:px-4 sm:py-2 text-sm border-2 rounded transition-colors ${
                  currentStep === 0 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-transparent' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: currentStep === 0 ? '#f3f4f6' : '#ffffff',
                  color: currentStep === 0 ? '#6b7280' : '#111827',
                  borderColor: currentStep === 0 ? 'transparent' : '#e5e7eb'
                }}
              >
                Προηγούμενο
              </button>
              
              <button
                onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                disabled={
                  (currentStep === 0 && !formData.address) || 
                  (currentStep === 1 && !formData.wasteType) || 
                  (currentStep === 2 && !formData.loading)
                }
                className={`px-3 py-2 sm:px-4 sm:py-2 text-sm rounded border-2 transition-colors ${
                  (currentStep === 0 && !formData.address) || 
                  (currentStep === 1 && !formData.wasteType) || 
                  (currentStep === 2 && !formData.loading)
                    ? 'opacity-40 cursor-not-allowed'
                    : ''
                }`}
                style={{
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  borderColor: '#22c55e'
                }}
              >
                {currentStep === steps.length - 1 ? 'Υποβολή' : 'Επόμενο'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 