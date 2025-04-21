export interface FormValidationResult {
  isValid: boolean;
  customerId?: string;
  customerName?: string;
  error?: string;
  submittedAt?: string;
  expiredAt?: string;
}

export interface FormSubmissionData {
  [key: string]: any;
} 