import React from 'react';

interface ValidationErrorProps {
  error?: string;
  className?: string;
  submittedAt?: string;
  expiredAt?: string;
  customerId?: string;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ 
  error, 
  className = '',
  submittedAt,
  customerId
}) => {
  if (!error) return null;
  
  // Determine if this is a submission or expiration error based on the content
  const isSubmissionError = error.includes('έχει ήδη υποβληθεί');
  const isExpirationError = error.includes('έχει λήξει');
  
  // Choose theme based on error type
  let iconPath;
  let themeColors;
  let title;
  
  if (isSubmissionError) {
    // Use a checkmark for submission errors (as it's a completed action)
    iconPath = <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />;
    themeColors = {
      bgColor: 'bg-[#354f52]',
      borderColor: 'border-[#52796f]',
      textColor: 'text-[#cad2c5]',
      titleColor: 'text-[#84a98c]',
      iconColor: 'text-[#22c55e]'
    };
    title = 'Η Φόρμα Έχει Υποβληθεί';
  } else if (isExpirationError) {
    // Use a clock for expiration errors
    iconPath = <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />;
    themeColors = {
      bgColor: 'bg-[#354f52]',
      borderColor: 'border-[#52796f]',
      textColor: 'text-[#cad2c5]',
      titleColor: 'text-[#84a98c]',
      iconColor: 'text-amber-500'
    };
    title = 'Ο Σύνδεσμος Έχει Λήξει';
  } else {
    // Default error icon
    iconPath = <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />;
    themeColors = {
      bgColor: 'bg-[#354f52]',
      borderColor: 'border-[#52796f]',
      textColor: 'text-[#cad2c5]',
      titleColor: 'text-[#84a98c]',
      iconColor: 'text-red-500'
    };
    title = 'Σφάλμα Επικύρωσης';
  }
  
  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
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
    
    return `${day}, ${dayOfMonth} ${month} ${year} και ώρα ${hours}:${minutes}`;
  };

  const formattedSubmissionDate = formatDate(submittedAt);
  
  return (
    <div className={`border rounded-lg p-5 shadow-md flex flex-col items-center ${themeColors.bgColor} ${themeColors.borderColor} ${className}`}>
      {/* Logo */}
      <div className="mb-6 mt-2">
        <img 
          src="/assets/images/logo.png" 
          alt="Λογότυπο Εταιρείας" 
          className="h-16 mx-auto"
        />
      </div>
      
      <div className="flex items-center mb-4">
        <div className={`flex-shrink-0 ${themeColors.iconColor}`}>
          <svg className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            {iconPath}
          </svg>
        </div>
        <h3 className={`text-2xl font-medium ml-3 ${themeColors.titleColor}`}>{title}</h3>
      </div>
      
      <div className={`${themeColors.textColor} text-center w-full`}>
        {isSubmissionError ? (
          <>
            <p className="text-lg">Αυτή η φόρμα έχει ήδη υποβληθεί</p>
            {formattedSubmissionDate && (
              <p className="text-base mt-1 font-light">
                {formattedSubmissionDate}
              </p>
            )}
          </>
        ) : (
          <p className="text-base">{error}</p>
        )}
        
        {isSubmissionError && customerId && (
          <div className="mt-6 pt-4 border-t border-[#52796f]">
            <p className="text-lg italic">
              Ευχαριστούμε για την υποβολή της προσφοράς σας.
            </p>
          </div>
        )}
        
        {(isSubmissionError || isExpirationError) && (
          <div className="mt-4 flex justify-center items-center">
            <svg className="h-5 w-5 mr-2 text-[#84a98c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[#84a98c] text-sm">
              Για περισσότερες πληροφορίες, παρακαλούμε επικοινωνήστε μαζί μας.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 