export interface ValidationResult {
  isValid: boolean;
  customerId?: string;
  customerName?: string;
  error?: string;
  expiredAt?: string;
  submittedAt?: string;
}

export interface FormLinkStatus {
  status: 'pending' | 'expired' | 'submitted';
} 